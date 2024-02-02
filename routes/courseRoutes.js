import express from "express";
import { addNewLecture, createNewCourse, deleteACourse, deleteLecture, editCourseDetails, getAllCourses, getCourseLectures } from "../controllers/courseController.js";
import { isAuthenticated, isVerifiedCourseUser, isVerifiedInstructor } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router();

router.route("/courses").get(getAllCourses);

router.route("/createcourse").post(isAuthenticated, isVerifiedInstructor, singleUpload, createNewCourse);

router.route("/courses/:id").get(isAuthenticated, isVerifiedCourseUser, getCourseLectures).post(isAuthenticated, isVerifiedInstructor, singleUpload, addNewLecture).put(isAuthenticated, isVerifiedInstructor, singleUpload, editCourseDetails).delete(isAuthenticated, isVerifiedInstructor, deleteACourse);

router.route("/lecture").delete(isAuthenticated, isVerifiedInstructor, deleteLecture);

export default router;