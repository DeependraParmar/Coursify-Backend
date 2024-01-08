import express from "express";
import { checkOut, paymentVerification } from "../controllers/paymentController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.route("/checkout").post(isAuthenticated,checkOut);

router.route("/paymentverification").post(isAuthenticated,paymentVerification);

router.route("/paymentverification/:course_id").get(isAuthenticated,paymentVerification);


export default router;