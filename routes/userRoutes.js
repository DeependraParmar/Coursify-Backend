import express from "express";
import { changePassword, forgetPassword, getCreatedCourses, getMyCourses, getPublicProfile, htmlToPdf, login, logout, myProfile, register, registerAsInstructor, resetPassword, updateProfile, updateProfilePicture, verifyRegister } from "../controllers/userControllers.js";
import { isAuthenticated, isVerifiedInstructor } from "../middlewares/auth.js";
import { standardRateLimit, strictRateLimit } from "../middlewares/rateLimit.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router();



// *************** ROUTES FOR USER PROFILE AND LOGOUT *******************************
// route for getting the profile of the user 


router.post("/register", strictRateLimit, register);
router.post("/verify-register", strictRateLimit, verifyRegister);
router.get("/receipt/:id", htmlToPdf);
router.post("/login",strictRateLimit, login);
router.get("/profile",standardRateLimit, isAuthenticated, myProfile);
router.put("/updateprofile",standardRateLimit, isAuthenticated, updateProfile);
router.put("/updateprofilepicture",standardRateLimit, isAuthenticated, singleUpload, updateProfilePicture);
router.route("/changepassword").put(strictRateLimit, isAuthenticated, changePassword);
router.route("/forgotpassword").post(strictRateLimit, forgetPassword);
router.route("/resetpassword/:token").put(strictRateLimit, resetPassword);
router.route("/profile/mycourses").get(standardRateLimit, isAuthenticated, getMyCourses);
router.route("/profile/public/:id").get(standardRateLimit, getPublicProfile);


// routes for instructor
router.post("/be-an-instructor",strictRateLimit, isAuthenticated, singleUpload, registerAsInstructor);
router.get("/instructor/my-courses",standardRateLimit, isAuthenticated, isVerifiedInstructor, getCreatedCourses);



// route for logging the user out 
router.get("/logout",strictRateLimit, logout);

export default router;