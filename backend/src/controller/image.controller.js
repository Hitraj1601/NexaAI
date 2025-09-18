import GenImg from "../model/image.model.js";
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'
import * as fs from "node:fs";
import { uploadOnCloudinary } from '../utils/cloudinary.js';

export const createImage = asyncHandler(async (req, res) => {
    const { userPrompt } = req.body;
    if (!userPrompt) {
        throw new ApiError(404, "prompt not found")
    }

    const form = new FormData()
    form.append('prompt', userPrompt)

    const response = await fetch('https://clipdrop-api.co/text-to-image/v1', {
        method: 'POST',
        headers: {
            'x-api-key': process.env.CLIPDROP_API_KEY,
        },
        body: form,
    })

    if (!response.ok) {
        throw new ApiError(500, `Image generation failed: ${response.statusText}`);
    }

    const imageBuffer = await response.arrayBuffer();

    if (!imageBuffer || imageBuffer.byteLength === 0) {
        throw new ApiError(500, "Image generation failed. No image data found.");
    }
    //upload image on cloudinary
    // Convert ArrayBuffer to Buffer for Cloudinary upload
    const buffer = Buffer.from(imageBuffer);
    
    // Create a temporary file path for Cloudinary upload
    const tempFilePath = `./temp_${Date.now()}.png`;
    fs.writeFileSync(tempFilePath, buffer);
    
    const uploadResult = await uploadOnCloudinary(tempFilePath);
    
    if (!uploadResult) {
        throw new ApiError(500, "Failed to upload image to Cloudinary");
    }

    //save image in db
    const genImg = await GenImg.create({
        userPrompt: userPrompt,
        genImgUrl: uploadResult.url,
        user: req.user?._id
    })

    // Respond to client
    return res.status(201).json(new ApiResponse(201, "Image generated successfully", genImg));
})
