import RemoveBG from "../model/removeBG.model.js";
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import fs from 'fs'
import FormData from 'form-data'
import axios from 'axios'

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
    console.log('File exists check:', fs.existsSync(userImgURL))
    console.log('File path:', userImgURL)

    // Create FormData with file buffer instead of stream for better compatibility
    const fileBuffer = fs.readFileSync(userImgURL)
    console.log('File buffer created. Size:', fileBuffer.length)
    console.log('File extension for content type:', fileExtension)
    
    const form = new FormData()
    form.append('image_file', fileBuffer, {
        filename: `image${fileExtension}`,
        contentType: fileExtension === '.jpg' ? 'image/jpeg' : `image/${fileExtension.replace('.', '')}`
    })
    
    console.log('FormData created with file buffer. Buffer size:', fileBuffer.length)
    console.log('FormData headers:', form.getHeaders())

    try {
        const response = await axios.post('https://clipdrop-api.co/remove-background/v1', form, {
            headers: {
                'x-api-key': process.env.CLIPDROP_API_KEY,
                ...form.getHeaders()
            },
            responseType: 'arraybuffer'
        })

        console.log(`ClipDrop API Response: ${response.status} ${response.statusText}`)
        console.log('Response headers:', response.headers)

        const imageBuffer = response.data;

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
        
        // Handle axios errors
        if (error.response) {
            // API responded with error status
            const errorText = error.response.data ? Buffer.from(error.response.data).toString() : 'Unknown error';
            console.error('ClipDrop API Error:', errorText);
            
            if (error.response.status === 400) {
                throw new ApiError(400, `Bad Request: ${errorText}`);
            } else if (error.response.status === 401) {
                throw new ApiError(500, "Invalid ClipDrop API key");
            } else if (error.response.status === 402) {
                throw new ApiError(500, "Insufficient ClipDrop API credits");
            } else if (error.response.status === 403) {
                throw new ApiError(500, "ClipDrop API key revoked or invalid");
            } else if (error.response.status === 429) {
                throw new ApiError(429, "Too many requests. Please try again later");
            } else {
                throw new ApiError(500, `ClipDrop API error: ${error.response.status} ${error.response.statusText}`);
            }
        }
        
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

    // Create FormData with file buffer instead of stream for better compatibility
    const fileBuffer = fs.readFileSync(userImgURL)
    console.log('File buffer created. Size:', fileBuffer.length)
    console.log('File extension for content type:', fileExtension)
    
    const form = new FormData()
    form.append('image_file', fileBuffer, {
        filename: `image${fileExtension}`,
        contentType: fileExtension === '.jpg' ? 'image/jpeg' : `image/${fileExtension.replace('.', '')}`
    })
    
    console.log('FormData created with file buffer. Buffer size:', fileBuffer.length)
    console.log('FormData headers:', form.getHeaders())

    try {
        const response = await axios.post('https://clipdrop-api.co/remove-background/v1', form, {
            headers: {
                'x-api-key': process.env.CLIPDROP_API_KEY,
                ...form.getHeaders()
            },
            responseType: 'arraybuffer'
        })

        const imageBuffer = response.data;
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
        
        // Handle axios errors
        if (error.response) {
            // API responded with error status
            const errorText = error.response.data ? Buffer.from(error.response.data).toString() : 'Unknown error';
            console.error('ClipDrop API Error:', errorText);
            
            if (error.response.status === 400) {
                throw new ApiError(400, `Bad Request: ${errorText}`);
            } else if (error.response.status === 401) {
                throw new ApiError(500, "Invalid ClipDrop API key");
            } else if (error.response.status === 402) {
                throw new ApiError(500, "Insufficient ClipDrop API credits");
            } else if (error.response.status === 403) {
                throw new ApiError(500, "ClipDrop API key revoked or invalid");
            } else if (error.response.status === 429) {
                throw new ApiError(429, "Too many requests. Please try again later");
            } else {
                throw new ApiError(500, `ClipDrop API error: ${error.response.status} ${error.response.statusText}`);
            }
        }
        
        const tempFilePath = `./temp_${Date.now()}.png`;
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
        throw error;
    }

})