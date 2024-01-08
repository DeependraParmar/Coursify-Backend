import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { changeRole, contact } from "../controllers/otherControllers.js";

const router = express.Router();

// for changing the role of a user between user and instructor 
router.get("/changeRole", isAuthenticated, changeRole);

// sending the message of the user to my mail
router.post("/contact", contact);


export default router;