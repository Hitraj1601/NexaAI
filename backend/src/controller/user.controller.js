// controllers/user.controller.js
import userModel from '../model/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import emailService from '../utils/emailService.js';

// -------------------- Helper function --------------------
const generateToken = (userId) => {
    console.log("🔍 Generating token for user ID:", userId);
    console.log("🔍 User ID toString:", userId.toString());
    // Extended token expiry for better user experience
    return jwt.sign({ _id: userId.toString() }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
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

// -------------------- Delete User Account --------------------
export const deleteUser = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Find and delete the user
    const user = await userModel.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Delete the user from database
    await userModel.findByIdAndDelete(userId);

    // Clear the auth cookie
    res.clearCookie('accessToken');
    
    res.status(200).json(new ApiResponse(200, "Account deleted successfully", null));
});

// -------------------- Forgot Password --------------------
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await userModel.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not found with this email address");
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set token and expiry (1 hour)
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    try {
        // Send email
        await emailService.sendPasswordResetEmail(email, resetToken, user.username);
        
        res.status(200).json(new ApiResponse(200, "Password reset email sent successfully", {
            message: "If this email exists, you will receive a password reset link shortly"
        }));
    } catch (error) {
        // Clear the reset token if email fails
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save({ validateBeforeSave: false });
        
        console.error("Email sending error:", error);
        throw new ApiError(500, "Error sending email. Please try again later.");
    }
});

// -------------------- Reset Password --------------------
export const resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
        throw new ApiError(400, "Token and new password are required");
    }

    if (newPassword.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters long");
    }

    // Hash the token to compare with stored hash
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const user = await userModel.findOne({
        resetPasswordToken: resetTokenHash,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(400, "Token is invalid or has expired");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send confirmation email
    try {
        await emailService.sendPasswordResetSuccessEmail(user.email, user.username);
    } catch (error) {
        console.error("Error sending confirmation email:", error);
        // Don't throw error here as password was successfully reset
    }

    res.status(200).json(new ApiResponse(200, "Password reset successful", {
        message: "Your password has been reset successfully. You can now sign in with your new password."
    }));
});

// -------------------- Verify Reset Token --------------------
export const verifyResetToken = asyncHandler(async (req, res) => {
    const { token } = req.params;
    
    if (!token) {
        throw new ApiError(400, "Token is required");
    }

    // Hash the token to compare with stored hash
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const user = await userModel.findOne({
        resetPasswordToken: resetTokenHash,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(400, "Token is invalid or has expired");
    }

    res.status(200).json(new ApiResponse(200, "Token is valid", {
        email: user.email
    }));
});

