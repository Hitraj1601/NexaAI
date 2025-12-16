import express from 'express';
import { 
    getUserProfile, 
    updateUserProfile, 
    getUserHistory, 
    deleteHistoryItem,
    getDashboardAnalytics 
} from '../controller/profile.controller.js';
import { authenticated } from '../middleware/auth.middleware.js';

const router = express.Router();

// Profile routes
router.get('/profile', authenticated, getUserProfile);
router.put('/profile', authenticated, updateUserProfile);

// History routes
router.get('/history', authenticated, getUserHistory);
router.delete('/history/:type/:id', authenticated, deleteHistoryItem);

// Analytics routes
router.get('/analytics', authenticated, getDashboardAnalytics);

export default router;