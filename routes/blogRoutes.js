import express from "express";
import { standardRateLimit } from "../middlewares/rateLimit.js";
import { isAuthenticated, isVerifiedAdmin } from "../middlewares/auth.js";
import { createBlog, deleteBlog, editBlog, getAllBlogs, getSpecificBlog } from "../controllers/blogControllers.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router();

router.route("/blogs/all").get(standardRateLimit, getAllBlogs);
router.route("/blogs/:id").get(standardRateLimit, getSpecificBlog);
router.route("/blogs/new").post(standardRateLimit, isAuthenticated, isVerifiedAdmin,singleUpload, createBlog);
router.route("/blogs/edit/:id").put(standardRateLimit, isAuthenticated, isVerifiedAdmin, singleUpload, editBlog);
router.route("/blogs/delete/:id").delete(standardRateLimit, isAuthenticated, isVerifiedAdmin, deleteBlog);

export default router;