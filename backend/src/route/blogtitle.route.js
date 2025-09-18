import express from "express";
import { createBlogTitle } from "../controller/blogtitle.controller.js";
import {authenticated} from "../middleware/auth.middleware.js";


const router = express.Router();

router.post("/create", authenticated, createBlogTitle);

export default router;
