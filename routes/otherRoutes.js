import express from "express";
import { isAuthenticated, isVerifiedInstructor } from "../middlewares/auth.js";
import { changeRole, contact, getInstructorStats } from "../controllers/otherControllers.js";

const router = express.Router();

// for changing the role of a user between user and instructor 
router.get("/changeRole", isAuthenticated, changeRole);

// sending the message of the user to my mail
router.post("/contact", contact);

// getting the instructor stats 
router.get("/instructor/dashboard", isAuthenticated, isVerifiedInstructor, getInstructorStats);

export default router;