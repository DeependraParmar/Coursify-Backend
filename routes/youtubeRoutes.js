import express from "express";
import { createFreeCourse, getFreeCourses } from "../controllers/youtubeControllers.js";
import { isAuthenticated, isVerifiedAdmin } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router();

router.route('/free-course').get(getFreeCourses).post(isAuthenticated, isVerifiedAdmin, singleUpload, createFreeCourse);





export default router;