import { createArticle } from "../controller/article.controller.js";
import express from "express";
import {authenticated} from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create", authenticated, createArticle);

export default router;
