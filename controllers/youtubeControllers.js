import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import Youtube from "../models/Youtube.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "cloudinary";


export const getFreeCourses = catchAsyncError( async(req, res, next) => {
    const courses = await Youtube.find({});

    if(!courses)
        return next(new ErrorHandler("No courses found", 404));

    res.status(200).json({
        success: true,
        courses,
    });
});

export const createFreeCourse = catchAsyncError( async(req, res, next) => {
    const { title, description} = req.body;
    const file = req.file;

    if(!title || !description || !file){
        return next(new ErrorHandler("Please enter all the fields", 400));
    }

    const dataUri = getDataUri(file);
    const cloud = await cloudinary.v2.uploader.upload(dataUri.content);

    await Youtube.create({
        title, description,
        poster: {
            public_id: cloud.public_id,
            url: cloud.secure_url,
        }
    });

    res.status(200).json({
        success: true,
        message: "Course created successfully",
    });
});

export const editFreeCourse = catchAsyncError( async(req, res, next) => {
    const { title, description} = req.body;
    const file = req.file;
    const course = await Youtube.findById(req.params.id);

    if(!course)
        return next(new ErrorHandler("Course not found", 404));

    if(title)
        course.title = title;

    if(description)
        course.description = description;

    if(file){
        await cloudinary.v2.uploader.destroy(course.poster.public_id);
        const dataUri = getDataUri(file);
        const cloud = await cloudinary.v2.uploader.upload(dataUri.content);

        course.poster = {
            public_id: cloud.public_id,
            url: cloud.secure_url,
        };
    }
    
    await course.save();

    res.status(200).json({
        success: true,
        message: "Course updated successfully",
    });
});

export const deleteFreeCourse = catchAsyncError( async(req, res, next) => {
    const course = await Youtube.findById(req.params.id);

    if(!course)
        return next(new ErrorHandler("Course not found", 404));

    await cloudinary.v2.uploader.destroy(course.poster.public_id);
    await course.remove();

    res.status(200).json({
        success: true,
        message: "Course deleted successfully",
    });
});