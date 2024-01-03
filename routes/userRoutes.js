import express from "express";
import {changePassword, googleAuthCallbackController, googleAuthController, googleAuthErrorController, googleAuthSuccessController, login, logout, myProfile, register, updateProfile, updateProfilePicture } from "../controllers/userControllers.js";
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

// route for logging the user out 
router.get("/logout", logout);

export default router;