import express from "express";
import { contact, getAdminsForAdminDashboard, getInstructorForAdminDashboard, getInstructorStats, getPublicProfile, getSpecificCourseForAdminDashboard, getTransactionsForAdminDashboard, getUserForAdminDashboard, inviteAFriend } from "../controllers/otherControllers.js";
import { isAuthenticated, isVerifiedAdmin, isVerifiedInstructor } from "../middlewares/auth.js";
import { standardRateLimit, strictRateLimit } from "../middlewares/rateLimit.js";

const router = express.Router();

// sending the message of the user to my mail
router.post("/contact", strictRateLimit, contact);

router.post('/invite', strictRateLimit, inviteAFriend);

// getting the public profile of the user
router.get("/profile/public/:id", standardRateLimit, getPublicProfile);

// getting the instructor stats 
router.get("/instructor/dashboard", standardRateLimit, isAuthenticated, isVerifiedInstructor, getInstructorStats);

// getting the user and the instructor count on admin dashboard 
router.get('/admin/users', standardRateLimit, isAuthenticated, isVerifiedAdmin, getUserForAdminDashboard);
router.get("/admin/instructors", standardRateLimit, isAuthenticated, isVerifiedAdmin, getInstructorForAdminDashboard);
router.get("/admin/admins", standardRateLimit, isAuthenticated, isVerifiedAdmin, getAdminsForAdminDashboard);
router.get("/admin/courses/:id", standardRateLimit, isAuthenticated, isVerifiedAdmin, getSpecificCourseForAdminDashboard);
router.get("/admin/transactions", standardRateLimit, isAuthenticated, isVerifiedAdmin, getTransactionsForAdminDashboard);

export default router;