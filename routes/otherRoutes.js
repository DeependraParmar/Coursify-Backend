import express from "express";
import { isAuthenticated, isVerifiedAdmin } from "../middlewares/auth.js";
import { changeRole, getReviewRequests } from "../controllers/otherControllers.js";

const router = express.Router();

// for changing the role of a user between user and instructor 
router.get("/changeRole", isAuthenticated, changeRole);

// for getting the review requests on the admin panel
router.route("/fetch-review-requests").get(isAuthenticated, isVerifiedAdmin, getReviewRequests);



export default router;