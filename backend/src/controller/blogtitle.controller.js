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
            console.log(response);
            
            // Parse JSON from the model response
            const raw = (typeof response.text === 'function' ? await response.text() : response.text || '').trim();
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
        
         return res.status(200).json(
             new ApiResponse(200, blogTitle, "Blog title generated successfully")
         );

})