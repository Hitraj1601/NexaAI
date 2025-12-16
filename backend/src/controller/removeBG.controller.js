import RemoveBG from "../model/removeBG.model.js";
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import fs from 'fs'
import FormData from 'form-data'

//replace bg from user image

// Authenticated endpoint: requires user to be logged in (used by dashboard / saved records)
export const remove_Background = asyncHandler(async (req, res) => {

    const userImgURL = req.files?.userImgURL?.[0]?.path

    if (!userImgURL) {
        throw new ApiError(400, "Image File is Required")
    }

    // Validate API key
    if (!process.env.CLIPDROP_API_KEY) {
        throw new ApiError(500, "ClipDrop API key not configured")
    }

    // Validate file exists
    if (!fs.existsSync(userImgURL)) {
        throw new ApiError(400, "Uploaded file not found")
    }

    // Get file stats for validation
    const fileStats = fs.statSync(userImgURL)
    const fileSizeInMB = fileStats.size / (1024 * 1024)
    
    // Validate file size (max 30MB according to ClipDrop docs)
    if (fileSizeInMB > 30) {
        throw new ApiError(400, `File too large: ${fileSizeInMB.toFixed(2)}MB. Maximum allowed: 30MB`)
    }

    // Validate file format
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp']
    const fileExtension = userImgURL.toLowerCase().substring(userImgURL.lastIndexOf('.'))
    if (!allowedExtensions.includes(fileExtension)) {
        throw new ApiError(400, `Invalid file format: ${fileExtension}. Allowed formats: PNG, JPG, JPEG, WEBP`)
    }

    console.log(`Processing image: ${userImgURL}, Size: ${fileSizeInMB.toFixed(2)}MB, Format: ${fileExtension}`)

    // Create FormData with file stream
    const form = new FormData()
    form.append('image_file', fs.createReadStream(userImgURL))

    try {
        const response = await fetch('https://clipdrop-api.co/remove-background/v1', {
            method: 'POST',
            headers: {
                'x-api-key': process.env.CLIPDROP_API_KEY,
                ...form.getHeaders()
            },
            body: form,
        })

        console.log(`ClipDrop API Response: ${response.status} ${response.statusText}`)
        console.log('Response headers:', Object.fromEntries(response.headers.entries()))

        if (!response.ok) {
            const errorText = await response.text()
            console.error('ClipDrop API Error:', errorText)
            
            // Handle specific error codes
            if (response.status === 400) {
                throw new ApiError(400, `Bad Request: ${errorText || 'Invalid image file or format'}`)
            } else if (response.status === 401) {
                throw new ApiError(500, "Invalid ClipDrop API key")
            } else if (response.status === 402) {
                throw new ApiError(500, "Insufficient ClipDrop API credits")
            } else if (response.status === 403) {
                throw new ApiError(500, "ClipDrop API key revoked or invalid")
            } else if (response.status === 429) {
                throw new ApiError(429, "Too many requests. Please try again later")
            } else {
                throw new ApiError(500, `ClipDrop API error: ${response.status} ${response.statusText}`)
            }
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
            // Clean up temp file
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }
            throw new ApiError(500, "Failed to upload image to Cloudinary");
        }

        // Clean up temp file after successful upload
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }

        const newImg = await RemoveBG.create(
            {
                userImgURL,
                resImgURL: uploadResult.secure_url,
                user: req.user?._id
            }
        )

        // Respond to client
        return res.status(201).json(new ApiResponse(201, "Background replaced successfully", newImg));
        
    } catch (error) {
        console.error('Error in remove_Background:', error);
        
        // Clean up any temporary files that might exist
        const tempFilePath = `./temp_${Date.now()}.png`;
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
        
        // Re-throw the error to be handled by asyncHandler
        throw error;
    }

})

// Public endpoint: does the same image background removal but does NOT require authentication.
// This is useful for the frontend public UI where users may not be logged in.
// NOTE: Because this endpoint is public, it will not attach `user` to the saved RemoveBG document.
export const remove_Background_Public = asyncHandler(async (req, res) => {

    // Reuse the same implementation as remove_Background but without expecting req.user

    const userImgURL = req.files?.userImgURL?.[0]?.path

    if (!userImgURL) {
        throw new ApiError(400, "Image File is Required")
    }

    if (!process.env.CLIPDROP_API_KEY) {
        throw new ApiError(500, "ClipDrop API key not configured")
    }

    if (!fs.existsSync(userImgURL)) {
        throw new ApiError(400, "Uploaded file not found")
    }

    const fileStats = fs.statSync(userImgURL)
    const fileSizeInMB = fileStats.size / (1024 * 1024)
    if (fileSizeInMB > 30) {
        throw new ApiError(400, `File too large: ${fileSizeInMB.toFixed(2)}MB. Maximum allowed: 30MB`)
    }

    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp']
    const fileExtension = userImgURL.toLowerCase().substring(userImgURL.lastIndexOf('.'))
    if (!allowedExtensions.includes(fileExtension)) {
        throw new ApiError(400, `Invalid file format: ${fileExtension}. Allowed formats: PNG, JPG, JPEG, WEBP`)
    }

    const form = new FormData()
    form.append('image_file', fs.createReadStream(userImgURL))

    try {
        const response = await fetch('https://clipdrop-api.co/remove-background/v1', {
            method: 'POST',
            headers: {
                'x-api-key': process.env.CLIPDROP_API_KEY,
                ...form.getHeaders()
            },
            body: form,
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('ClipDrop API Error:', errorText)
            if (response.status === 400) {
                throw new ApiError(400, `Bad Request: ${errorText || 'Invalid image file or format'}`)
            } else if (response.status === 401) {
                throw new ApiError(500, "Invalid ClipDrop API key")
            } else if (response.status === 402) {
                throw new ApiError(500, "Insufficient ClipDrop API credits")
            } else if (response.status === 403) {
                throw new ApiError(500, "ClipDrop API key revoked or invalid")
            } else if (response.status === 429) {
                throw new ApiError(429, "Too many requests. Please try again later")
            } else {
                throw new ApiError(500, `ClipDrop API error: ${response.status} ${response.statusText}`)
            }
        }

        const imageBuffer = await response.arrayBuffer();
        if (!imageBuffer || imageBuffer.byteLength === 0) {
            throw new ApiError(500, "Image generation failed. No image data found.");
        }

        const buffer = Buffer.from(imageBuffer);
        const tempFilePath = `./temp_${Date.now()}.png`;
        fs.writeFileSync(tempFilePath, buffer);

        const uploadResult = await uploadOnCloudinary(tempFilePath);

        if (!uploadResult) {
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }
            throw new ApiError(500, "Failed to upload image to Cloudinary");
        }

        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }

        // Save record without user reference (public request)
        const newImg = await RemoveBG.create(
            {
                userImgURL,
                resImgURL: uploadResult.secure_url,
            }
        )

        return res.status(201).json(new ApiResponse(201, "Background replaced successfully (public)", newImg));

    } catch (error) {
        console.error('Error in remove_Background_Public:', error);
        const tempFilePath = `./temp_${Date.now()}.png`;
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
        throw error;
    }

})