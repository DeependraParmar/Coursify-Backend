import express from "express";
import { changePassword, forgetPassword, getCreatedCourses, getMyCourses, getPublicProfile, login, logout, myProfile, register, registerAsInstructor, resetPassword, updateProfile, updateProfilePicture, verifyRegister } from "../controllers/userControllers.js";
import { isAuthenticated, isVerifiedInstructor } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router();



// *************** ROUTES FOR USER PROFILE AND LOGOUT *******************************
// route for getting the profile of the user 

router.post("/register", register);
router.post("/verify-register", verifyRegister);
router.post("/login", login);
router.get("/profile", isAuthenticated, myProfile);
router.put("/updateprofile", isAuthenticated, updateProfile);
router.put("/updateprofilepicture", isAuthenticated, singleUpload, updateProfilePicture);
router.route("/changepassword").put(isAuthenticated, changePassword);
router.route("/forgotpassword").post(forgetPassword);
router.route("/resetpassword/:token").put(resetPassword);
router.route("/profile/mycourses").get(isAuthenticated, getMyCourses);
router.route("/profile/public/:id").get(getPublicProfile);


// routes for instructor
router.post("/be-an-instructor", isAuthenticated, singleUpload, registerAsInstructor);
router.get("/instructor/my-courses", isAuthenticated, isVerifiedInstructor, getCreatedCourses);


// route for logging the user out 
router.get("/logout", logout);

export default router;