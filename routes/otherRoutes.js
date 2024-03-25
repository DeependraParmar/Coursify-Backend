import express from "express";
import { changeRole, contact, getCoursesForAdminDashboard, getInstructorForAdminDashboard, getInstructorStats, getPublicProfile, getTransactionsForAdminDashboard, getUserForAdminDashboard } from "../controllers/otherControllers.js";
import { isAuthenticated, isVerifiedAdmin, isVerifiedInstructor } from "../middlewares/auth.js";

const router = express.Router();

// for changing the role of a user between user and instructor 
router.get("/changeRole", isAuthenticated, changeRole);

// sending the message of the user to my mail
router.post("/contact", contact);

// getting the public profile of the user
router.get("/profile/public/:id", getPublicProfile);

// getting the instructor stats 
router.get("/instructor/dashboard", isAuthenticated, isVerifiedInstructor, getInstructorStats);

// getting the user and the instructor count on admin dashboard 
router.get('/admin/users', isAuthenticated, isVerifiedAdmin, getUserForAdminDashboard);
router.get("/admin/instructors", isAuthenticated, isVerifiedAdmin, getInstructorForAdminDashboard);
router.get("/admin/courses/all", isAuthenticated, isVerifiedAdmin, getCoursesForAdminDashboard);
router.get("/admin/transactions", isAuthenticated, isVerifiedAdmin, getTransactionsForAdminDashboard);

export default router;