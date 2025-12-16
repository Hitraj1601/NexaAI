import GenImg from "../model/image.model.js";
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'
import * as fs from "node:fs";
import { uploadOnCloudinary } from '../utils/cloudinary.js';

export const createImage = asyncHandler(async (req, res) => {
    const { prompt } = req.body;
    
    if (!prompt || !prompt.trim()) {
        throw new ApiError(400, "Prompt is required")
    }

    console.log('Image generation request - Prompt:', prompt.trim()); // Debug log

    // Validate API key
    if (!process.env.CLIPDROP_API_KEY) {
        throw new ApiError(500, "ClipDrop API key is not configured");
    }

    console.log('Sending request to ClipDrop API with prompt:', prompt.trim()); // Debug log

    // Simple JSON request with only prompt
    const requestBody = {
        prompt: prompt.trim()
    };

    const response = await fetch('https://clipdrop-api.co/text-to-image/v1', {
        method: 'POST',
        headers: {
            'x-api-key': process.env.CLIPDROP_API_KEY,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    })

    console.log('ClipDrop API response status:', response.status); // Debug log
    console.log('ClipDrop API response headers:', Object.fromEntries(response.headers.entries())); // Debug log

    if (!response.ok) {
        // Get more detailed error information
        let errorMessage = `Image generation failed: ${response.status} ${response.statusText}`;
        try {
            const errorText = await response.text();
            console.log('ClipDrop API error details:', errorText);
            errorMessage += ` - ${errorText}`;
        } catch (e) {
            console.log('Could not read error response body');
        }
        throw new ApiError(500, errorMessage);
    }

    const imageBuffer = await response.arrayBuffer();

    if (!imageBuffer || imageBuffer.byteLength === 0) {
        throw new ApiError(500, "Image generation failed. No image data found.");
    }

    console.log('Image buffer received, size:', imageBuffer.byteLength, 'bytes'); // Debug log
    
    //upload image on cloudinary
    // Convert ArrayBuffer to Buffer for Cloudinary upload
    const buffer = Buffer.from(imageBuffer);
    
    // Create a temporary file path for Cloudinary upload
    const tempFilePath = `./public/temp/temp_${Date.now()}.png`;
    
    try {
        // Ensure temp directory exists
        const tempDir = './public/temp';
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        fs.writeFileSync(tempFilePath, buffer);
        console.log('Temporary file created:', tempFilePath); // Debug log
        
        const uploadResult = await uploadOnCloudinary(tempFilePath);
        
        if (!uploadResult) {
            throw new ApiError(500, "Failed to upload image to Cloudinary");
        }

        console.log('Image uploaded to Cloudinary:', uploadResult.url); // Debug log

        //save image in db
        const genImg = await GenImg.create({
            userPrompt: prompt,
            genImgUrl: uploadResult.url,
            user: req.user?._id
        })

        console.log('Generated image saved to database:', genImg._id); // Debug log

        // Respond to client with simple format
        return res.status(201).json(new ApiResponse(201, "Image generated successfully", {
            id: genImg._id,
            url: genImg.genImgUrl,
            prompt: genImg.userPrompt
        }));
        
    } catch (error) {
        console.error('Error in image processing:', error);
        throw error;
    } finally {
        // Clean up temporary file
        try {
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
                console.log('Temporary file cleaned up:', tempFilePath); // Debug log
            }
        } catch (cleanupError) {
            console.error('Error cleaning up temporary file:', cleanupError);
        }
    }
})
