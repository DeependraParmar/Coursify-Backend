import express from "express";
import { isAuthenticated } from "../middlewares/auth";
import { changeRole } from "../controllers/otherControllers";

const router = express.Router();


router.get("/changeRole", isAuthenticated, changeRole);




export default router;