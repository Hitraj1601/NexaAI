import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        maxLength: 500,
        default: ''
    },
    company: {
        type: String,
        maxLength: 100,
        default: ''
    },
    location: {
        type: String,
        maxLength: 100,
        default: ''
    },
    website: {
        type: String,
        maxLength: 200,
        default: ''
    },
    avatar: {
        type: String,
        default: ''
    },
    plan: {
        type: String,
        enum: ['free', 'pro', 'enterprise'],
        default: 'free'
    },
    lastLoginAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
export default User;