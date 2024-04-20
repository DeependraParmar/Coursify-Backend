import express from "express";
import { isAuthenticated, isVerifiedAdmin } from "../middlewares/auth.js"
import singleUpload from "../middlewares/multer.js";
import { deleteFromDropbox, getFromDropbox, uploadToDropbox } from "../controllers/dropboxControllers.js";

const router = express.Router();

router.route("/upload").post(isAuthenticated, isVerifiedAdmin, singleUpload, uploadToDropbox );
router.route("/get-dropbox").get(isAuthenticated, isVerifiedAdmin, getFromDropbox );
router.route("/delete-image/:id").delete(isAuthenticated, isVerifiedAdmin, deleteFromDropbox );


export default router;