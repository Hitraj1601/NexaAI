import express from 'express';
import { 
    getUserProfile, 
    updateUserProfile, 
    getUserHistory, 
    deleteHistoryItem,
    getDashboardAnalytics,
    clearCache
} from '../controller/profile.controller.optimized.js';
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

// Cache management (development only)
if (process.env.NODE_ENV === 'development') {
    router.delete('/cache', authenticated, clearCache);
}

export default router;