import { createArticle } from "../controller/article.controller.js";
import express from "express";
import {authenticated} from "../middleware/auth.middleware.js";

const router = express.Router();

//sample url to test: http://localhost:5000/api/article/create
// Authenticated create (requires user to be logged in)
router.post("/create", authenticated, createArticle);

export default router;
