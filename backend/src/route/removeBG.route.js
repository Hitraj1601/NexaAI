import express from 'express'
import { authenticated } from "../middleware/auth.middleware.js";
import { remove_Background, remove_Background_Public } from "../controller/removeBG.controller.js"
import { upload } from '../middleware/multer.middleware.js'
const router = express.Router()

// Authenticated route (stores user in DB)
router.post("/removeBG",authenticated, upload.fields([{ name: "userImgURL", maxCount: 1, }]), remove_Background);

// Public route: does not require authentication. Frontend can call this when no user token is available.
router.post("/removeBG-public", upload.fields([{ name: "userImgURL", maxCount: 1, }]), remove_Background_Public);

export default router;
