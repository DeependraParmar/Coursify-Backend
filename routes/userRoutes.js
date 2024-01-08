import express from "express";
import { changePassword, forgetPassword, getMyCourses, googleAuthCallbackController, googleAuthController, googleAuthErrorController, googleAuthSuccessController, login, logout, myProfile, register, registerAsInstructor, resetPassword, updateProfile, updateProfilePicture } from "../controllers/userControllers.js";
import { isAuthenticated } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router();


// *************** ROUTES FOR GOOGLE AUTHENTICATION *******************************
// creating the route for google authentication
router.get("/auth/google", googleAuthController);

// creating a route for the login button and the logout button 
router.get("/auth/google/callback", googleAuthCallbackController);

// creating a route for the successfull google authentication 
router.get("/auth/google/success", googleAuthSuccessController);

// creating a route for error while google authentication 
router.get("/auth/google/error", googleAuthErrorController);



// *************** ROUTES FOR USER PROFILE AND LOGOUT *******************************
// route for getting the profile of the user 

router.post("/register", register);
router.post("/login", login);
router.get("/profile", isAuthenticated, myProfile);
router.post("/updateprofile", isAuthenticated, updateProfile);
router.put("/updateprofilepicture", isAuthenticated,singleUpload, updateProfilePicture);
router.route("/changepassword").put(isAuthenticated, changePassword);
router.route("/forgotpassword").post(forgetPassword);
router.route("/resetpassword/:token").put(resetPassword);
router.route("/profile/mycourses").get(isAuthenticated, getMyCourses);



// routes for instructor
router.post("/be-an-instructor",isAuthenticated,singleUpload,registerAsInstructor);


// routes for admin



// route for logging the user out 
router.get("/logout", logout);

export default router;