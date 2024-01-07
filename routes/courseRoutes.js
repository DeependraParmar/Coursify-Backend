import express from "express";
import { createNewCourse, getAllCourses } from "../controllers/courseController.js";
import { isAuthenticated, isVerifiedInstructor } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router();

router.route("/courses").get(getAllCourses);

router.route("/createcourse").post(isAuthenticated, isVerifiedInstructor, singleUpload, createNewCourse)


export default router;