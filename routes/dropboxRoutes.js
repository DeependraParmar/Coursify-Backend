import express from "express";
import { isAuthenticated, isVerifiedAdmin } from "../middlewares/auth.js"
import singleUpload from "../middlewares/multer.js";
import { addNote, deleteFromDropbox, deleteNote, getFromDropbox, getNotes, uploadToDropbox } from "../controllers/dropboxControllers.js";
import { standardRateLimit } from "../middlewares/rateLimit.js";

const router = express.Router();

// routes for images
router.route("/upload").post(standardRateLimit, isAuthenticated, isVerifiedAdmin, singleUpload, uploadToDropbox );
router.route("/get-dropbox").get(standardRateLimit, isAuthenticated, isVerifiedAdmin, getFromDropbox );
router.route("/delete-image/:id").delete(standardRateLimit, isAuthenticated, isVerifiedAdmin, deleteFromDropbox );

// routes for notes
router.route("/add-note").post(standardRateLimit, isAuthenticated, isVerifiedAdmin, addNote);
router.route("/get-notes").get(standardRateLimit, isAuthenticated, isVerifiedAdmin, getNotes);
router.route("/delete-note/:id").delete(standardRateLimit, isAuthenticated, isVerifiedAdmin, deleteNote);

export default router;