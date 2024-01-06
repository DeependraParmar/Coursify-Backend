import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { changeRole } from "../controllers/otherControllers.js";

const router = express.Router();

// for changing the role of a user between user and instructor 
router.get("/changeRole", isAuthenticated, changeRole);





export default router;