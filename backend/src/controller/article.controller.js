import Article from "../model/article.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { GoogleGenAI, Type } from "@google/genai";

// Create a new article
export const createArticle = asyncHandler(async (req, res) => {

    const { title, tone, length, topic } = req.body;
    if (!topic) {
        throw new ApiError(400, 'Topic is required');
    }

    // Generate title and content based on the prompt
    // Ensure API key is available
    if (!process.env.GEMINI_API_KEY) {
        throw new ApiError(500, "GEMINI_API_KEY is missing. Set it in your .env file.");
    }

    // Initialize GoogleGenAI client at request time
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Construct enhanced prompt with all parameters
    const wordCounts = {
        'short': '300-500',
        'medium': '800-1200', 
        'long': '1500-2000'
    };
    const targetWords = wordCounts[length] || '800-1200';
    
    const userPrompt = `Write a ${tone || 'professional'} article about: ${topic}
    ${title ? `Use this title: "${title}"` : 'Generate an engaging title'}
    Target length: ${targetWords} words
    Tone: ${tone || 'professional'}
    
    Requirements:
    - Create engaging, well-structured content
    - Use proper headings and subheadings  
    - Include introduction, main body with clear sections, and conclusion
    - Write in ${tone || 'professional'} tone throughout
    - Make it informative and valuable to readers`;

    // Generate article instructing the model to return ONLY structured JSON
    const prompt = `You are a professional content writer. Write an article based on these specifications:
                    
                    ${userPrompt}
                    
                    Return ONLY JSON with this exact shape and nothing else: 
                    { 
                        "title": string (engaging title, <= 120 chars), 
                        "content": string (well-formatted article with markdown headings, >= ${targetWords.split('-')[0]} words)
                    }`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    content: { type: Type.STRING },
                },
                required: ["title", "content"],
            },
        },
    });

    // Parse JSON from the model response - handle new response structure
    console.log('Full response:', JSON.stringify(response, null, 2));
    
    let raw = '';
    
    // Debug the candidates structure
    if (response.candidates && response.candidates[0]) {
        console.log('First candidate:', JSON.stringify(response.candidates[0], null, 2));
        const candidate = response.candidates[0];
        
        if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
            console.log('Content parts:', JSON.stringify(candidate.content.parts, null, 2));
            raw = candidate.content.parts[0].text?.trim() || '';
        }
    }
    
    // Fallback to other possible response structures
    if (!raw && typeof response.text === 'function') {
        raw = (await response.text()).trim();
    } else if (!raw && response.text) {
        raw = response.text.trim();
    }
    
    console.log('Extracted raw text:', raw);
    
    if (!raw) {
        throw new ApiError(500, "No content received from AI model. Please try again.");
    }
    
    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch (e) {
        throw new ApiError(500, "Model returned invalid JSON. Please try again.");
    }
    if (!parsed?.title || !parsed?.content) {
        throw new ApiError(500, "Model did not return title/content. Please try again.");
    }

    
    // Save the generated article to the database (only save prompt, title, content, and user)
    const article = await Article.create({
        prompt: userPrompt,
        title: parsed.title,
        content: parsed.content,
        user: req.user._id 
    });

    return res.status(201).json(new ApiResponse(201, 'Article created successfully', article));
});