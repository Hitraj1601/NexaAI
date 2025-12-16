// controllers/user.controller.js
import userModel from '../model/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// -------------------- Helper function --------------------
const generateToken = (userId) => {
    console.log("🔍 Generating token for user ID:", userId);
    console.log("🔍 User ID toString:", userId.toString());
    return jwt.sign({ _id: userId.toString() }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
};

// -------------------- Register User --------------------
export const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
        throw new ApiError(400, "User already exists with this email");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({ username, email, password: hashedPassword });
    await user.save();

    const newUser = await userModel.findById(user._id).select('-password');

    // Generate JWT token and set cookie
    const token = generateToken(newUser._id);
    res.cookie('accessToken', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    res.status(201).json(new ApiResponse(201, "User registered successfully", { user: newUser, token }));
});

// -------------------- Login User --------------------
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await userModel.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }

    const loggedInUser = await userModel.findById(user._id).select('-password');

    console.log("🔍 Login user._id:", user._id);
    console.log("🔍 Login user._id type:", typeof user._id);
    const token = generateToken(user._id);
    res.cookie('accessToken', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    // Also return token in response body as a convenience for development and
    // for clients that prefer Authorization header (frontend will store it in localStorage).
    res.status(200).json(new ApiResponse(200, "User logged in successfully", { user: loggedInUser, token }));
});

// -------------------- Logout User --------------------
export const logoutUser = asyncHandler(async (req, res) => {
    res.clearCookie('accessToken');
    res.status(200).json(new ApiResponse(200, null,"User logged out successfully"));
});

