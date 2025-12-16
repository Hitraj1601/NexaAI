
import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../model/user.model.js";
import mongoose from "mongoose";

export const authenticated = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        
        console.log("🔍 Token received:", token ? "Present" : "Missing");
        
        if (!token) {
            throw new ApiError(401, 'You are not logged in! Please log in to get access.');
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log("🔍 Decoded token:", decodedToken);
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(decodedToken._id)) {
            console.log("🔍 Invalid ObjectId:", decodedToken._id);
            throw new ApiError(401, 'Invalid Access Token - Invalid ObjectId');
        }
        
        const user = await User.findById(decodedToken._id).select("-password");
        console.log("🔍 User found:", user ? "Yes" : "No", user?._id);
        
        if (!user) {
            throw new ApiError(401, 'Invalid Access Token - User not found');
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("🔍 Auth error:", error.message);
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});