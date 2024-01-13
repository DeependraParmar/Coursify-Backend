import express from "express";
import { isAuthenticated, isVerifiedAdmin, isVerifiedInstructor } from "../middlewares/auth.js";
import { changeRole, contact, getAdminDashboardData, getAdminStatsCount, getInstructorStats, getTotalAdminStatEarning } from "../controllers/otherControllers.js";

const router = express.Router();

// for changing the role of a user between user and instructor 
router.get("/changeRole", isAuthenticated, changeRole);

// sending the message of the user to my mail
router.post("/contact", contact);

// getting the instructor stats 
router.get("/instructor/dashboard", isAuthenticated, isVerifiedInstructor, getInstructorStats);

// getting the user and the instructor count on admin dashboard 
router.get("/admin/count",isAuthenticated, isVerifiedAdmin, getAdminStatsCount);
router.get("/admin/data",isAuthenticated, isVerifiedAdmin, getAdminDashboardData);
router.get("/admin/earning", isAuthenticated, isVerifiedAdmin, getTotalAdminStatEarning);

export default router;