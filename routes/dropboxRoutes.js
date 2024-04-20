import express from "express";
import { isAuthenticated, isVerifiedAdmin } from "../middlewares/auth.js"
import singleUpload from "../middlewares/multer.js";
import { addNote, deleteFromDropbox, deleteNote, getFromDropbox, getNotes, uploadToDropbox } from "../controllers/dropboxControllers.js";
import { isValidObjectId } from "mongoose";

const router = express.Router();

// routes for images
router.route("/upload").post(isAuthenticated, isVerifiedAdmin, singleUpload, uploadToDropbox );
router.route("/get-dropbox").get(isAuthenticated, isVerifiedAdmin, getFromDropbox );
router.route("/delete-image/:id").delete(isAuthenticated, isVerifiedAdmin, deleteFromDropbox );

// routes for notes
router.route("/add-note").post(isAuthenticated, isVerifiedAdmin, addNote);
router.route("/get-notes").get(isAuthenticated, isVerifiedAdmin, getNotes);
router.route("/delete-note/:id").delete(isAuthenticated, isVerifiedAdmin, deleteNote);

export default router;