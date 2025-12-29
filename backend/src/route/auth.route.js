import express from 'express';
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    deleteUser, 
    forgotPassword, 
    resetPassword, 
    verifyResetToken 
} from '../controller/user.controller.js';
import { authenticated } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.delete('/delete-account', authenticated, deleteUser);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-reset-token/:token', verifyResetToken);

export default router;