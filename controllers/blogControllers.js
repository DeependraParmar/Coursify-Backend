import {catchAsyncError} from '../middlewares/catchAsyncError.js';
import Blog from '../models/Blog.js';
import User from '../models/User.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import getDataUri from '../utils/dataUri.js';
import cloudinary from 'cloudinary';

export const getAllBlogs = catchAsyncError( async(req, res, next) => {
    const blogs = await Blog.find().sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        blogs,
    });
});

export const getSpecificBlog = catchAsyncError(async (req, res, next) => {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
        return next(new ErrorHandler("Blog not found", 404));
    }

    blog.views += 1;
    await blog.save();

    res.status(200).json({
        success: true,
        blog,
    });
});

export const createBlog = catchAsyncError(async (req, res, next) => {
    const { title, content } = req.body;
    const file = req.file;

    if (!title || !content || !file) {
        return next(new ErrorHandler("Please enter all fields", 400))
    }

    const fileUri = getDataUri(file);
    const cloud = await cloudinary.v2.uploader.upload(fileUri.content);

    await Blog.create({
        title,
        content,
        poster: {
            public_id: cloud.public_id,
            url: cloud.secure_url,
        }
    });

    res.status(200).json({
        success: true,
        message: "Blog created successfully",
    })
});

export const editBlog = catchAsyncError(async (req, res, next) => {
    const { title, content } = req.body;
    const file = req.file;

    const blog = await Blog.findById(req.params.id);

    if (!blog) 
        return next(new ErrorHandler("Blog not found", 404));
    
    if(title)
        blog.title = title;
    
    if(content)
        blog.content = content;
    
    if(file){
        await cloudinary.v2.uploader.destroy(blog.poster.public_id);
        const fileUri = getDataUri(file);
        const cloud = await cloudinary.v2.uploader.upload(fileUri.content);
        blog.poster = {
            public_id: cloud.public_id,
            url: cloud.secure_url,
        }
    }

    await blog.save();

    res.status(200).json({
        success: true,
        message: "Blog updated successfully",
    });
});

export const deleteBlog = catchAsyncError(async (req, res, next) => {
    const blog = await Blog.findById(req.params.id);

    if (!blog) 
        return next(new ErrorHandler("Blog not found", 404));
    
    await cloudinary.v2.uploader.destroy(blog.poster.public_id);
    await blog.deleteOne();

    res.status(200).json({
        success: true,
        message: "Blog deleted successfully",
    });
});