import Article from "../model/article.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { GoogleGenAI, Type } from "@google/genai";

// Create a new article
export const createArticle = asyncHandler(async (req, res) => {

    const { userPrompt } = req.body;
    if (!userPrompt) {
        throw new ApiError(400, 'Prompt is required');
    }

    // Generate title and content based on the prompt
    // Ensure API key is available
    if (!process.env.GEMINI_API_KEY) {
        throw new ApiError(500, "GEMINI_API_KEY is missing. Set it in your .env file.");
    }

    // Initialize GoogleGenAI client at request time
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Generate article instructing the model to return ONLY structured JSON
    const prompt = `You are a helpful assistant that writes articles based on the given prompt.
                    Prompt: ${userPrompt}
                    Return ONLY JSON with this exact shape and nothing else: { "title": string (<= 120 chars), "content": string (>= 500 words) }`;

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

    // Parse JSON from the model response
    const raw = (typeof response.text === 'function' ? await response.text() : response.text || '').trim();
    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch (e) {
        throw new ApiError(500, "Model returned invalid JSON. Please try again.");
    }
    if (!parsed?.title || !parsed?.content) {
        throw new ApiError(500, "Model did not return title/content. Please try again.");
    }

    
    // Save the generated article to the database (without user association since no auth)
    const article = await Article.create({
        prompt: userPrompt,
        title: parsed.title,
        content: parsed.content,
        user: req.user?._id 
    });

    return res.status(201).json(new ApiResponse(201, article, 'Article created successfully'));
});