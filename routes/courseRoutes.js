import express from "express";
import { addNewLecture, createNewCourse, deleteACourse, deleteLecture, editCourseDetails, getAllCourses, getCourseLectures, getCourseStatus, getSpecificCourse } from "../controllers/courseController.js";
import { isAuthenticated, isVerifiedCourseUser, isVerifiedInstructor } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";
import { strictRateLimit, standardRateLimit } from "../middlewares/rateLimit.js";

const router = express.Router();

router.route("/courses").get(standardRateLimit, getAllCourses);

router.route("/course/:id").get(standardRateLimit, getSpecificCourse);

router.route("/ispurchased/:id").get(standardRateLimit, isAuthenticated, getCourseStatus);

router.route("/createcourse").post(standardRateLimit, isAuthenticated, isVerifiedInstructor, singleUpload, createNewCourse);

router.route("/courses/:id").get(standardRateLimit, isAuthenticated, isVerifiedCourseUser, getCourseLectures).post(standardRateLimit, isAuthenticated, isVerifiedInstructor, singleUpload, addNewLecture).put(standardRateLimit, isAuthenticated, isVerifiedInstructor, singleUpload, editCourseDetails).delete(standardRateLimit, isAuthenticated, isVerifiedInstructor, deleteACourse);

router.route("/lecture").delete(standardRateLimit, isAuthenticated, isVerifiedInstructor, deleteLecture);

export default router;