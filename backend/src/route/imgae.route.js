import express from 'express'
import {authenticated} from "../middleware/auth.middleware.js";
import {createImage} from "../controller/image.controller.js"
const router= express.Router()


//sample url : http://localhost:3000/api/image/createimg
router.post("/createimg", authenticated,createImage);
export default router;
