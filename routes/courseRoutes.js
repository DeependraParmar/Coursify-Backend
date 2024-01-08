import express from "express";
import { addNewLecture, createNewCourse, deleteACourse, getAllCourses, getCourseLectures } from "../controllers/courseController.js";
import { isAuthenticated, isVerifiedCourseUser, isVerifiedInstructor } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router();

router.route("/courses").get(getAllCourses);

router.route("/createcourse").post(isAuthenticated, isVerifiedInstructor, singleUpload, createNewCourse);

router.route("/courses/:id").get(isAuthenticated, isVerifiedCourseUser, getCourseLectures).post(isAuthenticated, isVerifiedInstructor, singleUpload, addNewLecture).delete(isAuthenticated, isVerifiedInstructor, deleteACourse);

router.route("/lecture").delete(isAuthenticated, isVerifiedInstructor, );

export default router;