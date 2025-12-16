import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { GoogleGenAI, Type } from "@google/genai";
import BlogTitle from "../model/blogtitle.model.js";

//create blogtitle
export const createBlogTitle = asyncHandler(async(req,res)=>{
     const {userContent} = req.body;
     if(!userContent){
         throw new ApiError(400,"User content is required");
     } 
     
        // Ensure API key is available
        if (!process.env.GEMINI_API_KEY) {
            throw new ApiError(500, "GEMINI_API_KEY is missing. Set it in your .env file.");
        }

        // Initialize GoogleGenAI client at request time
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

         // Generate blog title using Gemini AI
         const prompt = `You are a helpful assistant that writes short, catchy blog titles. Here is a blog article:
                        ${userContent}
                        Give me only a single catchy blog title for this article. Keep it under 60 characters and make it engaging.
                        Return ONLY JSON with this exact shape and nothing else: { "title": string }`;

         const response = await ai.models.generateContent({
             model: "gemini-2.5-flash",
             contents: prompt,
             config: {
               responseMimeType: "application/json",
               responseSchema: {
                 type: Type.OBJECT,
                 properties: {
                   title: { type: Type.STRING },
                 },
                 required: ["title"],
               },
             },
           });
            if (!response) {
                throw new ApiError(500, "Failed to generate blog title. Please try again.");
            }
            console.log('Full response:', JSON.stringify(response, null, 2));
            
            // Parse JSON from the model response - handle new response structure
            let raw = '';
            
            // Try multiple methods to extract text content
            try {
                // Method 1: Direct text() method call
                if (typeof response.text === 'function') {
                    raw = await response.text();
                    console.log('Method 1 - response.text():', raw);
                }
            } catch (error) {
                console.log('Method 1 failed:', error.message);
            }
            
            // Method 2: Access candidates structure
            if (!raw && response.candidates && response.candidates[0]) {
                console.log('First candidate:', JSON.stringify(response.candidates[0], null, 2));
                const candidate = response.candidates[0];
                
                if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
                    console.log('Content parts:', JSON.stringify(candidate.content.parts, null, 2));
                    raw = candidate.content.parts[0].text?.trim() || '';
                    console.log('Method 2 - candidates text:', raw);
                }
            }
            
            // Method 3: Direct text property
            if (!raw && response.text) {
                raw = response.text.trim();
                console.log('Method 3 - direct text:', raw);
            }
            
            console.log('Extracted raw text:', raw);
            
            if (!raw) {
                throw new ApiError(500, "No content received from AI model. Please try again.");
            }
            
            let parsed;
            try {
                parsed = JSON.parse(raw);
            } catch {
                throw new ApiError(500, "Model returned invalid JSON for blog title. Please try again.");
            }
            if (!parsed?.title) {
                throw new ApiError(500, "Model did not return a title. Please try again.");
            }
         // Save to database
         const blogTitle =  await BlogTitle.create({
             userContent,
             title: parsed.title,
             user: req.user?.id // Assuming you have user authentication
         });
        
         console.log('Created blogTitle:', blogTitle); // Debug log
         console.log('Title from database:', blogTitle.title); // Debug log
         
         return res.status(200).json(
             new ApiResponse(200, "Blog title generated successfully", blogTitle)
         );

})