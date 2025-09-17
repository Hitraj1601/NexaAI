import Article from "../model/article.model.js";
import User from "../model/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import axios from "axios";

// Create a new article
export const createArticle = asyncHandler(async (req, res) => {

    const { userPrompt } = req.body;
    
    if (!userPrompt) {
        throw new ApiError(400, 'Prompt is required');
    }

    // Generate title and content based on the prompt
    const result = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
            contents: [{ parts: [{ text: userPrompt }] }],
        },
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
    console.log(result.data);

    if (!result.data || !result.data.candidates || result.data.candidates.length === 0) {
        throw new ApiError(500, 'Failed to generate article content');
    }
    // Save the generated article to the database (without user association since no auth)
    const article = await Article.create({
        prompt: userPrompt,
        title: result.data.candidates[0].content?.parts?.[0]?.text?.split('\n')[0] || 'Untitled',
        content: result.data.candidates[0].content?.parts?.[0]?.text || 'No content generated',
        user: null // No user association since authentication is removed
    });

    res.json(new ApiResponse(201, 'Article created successfully', result.data.candidates[0]));
});