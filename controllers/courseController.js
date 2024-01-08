import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Course } from "../models/Course.js";
import User from "../models/User.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "cloudinary"


// controller for getting all the courses 
export const getAllCourses = catchAsyncError(async(req,res,next) => {
    const courses = await Course.find().select('-lectures');

    if(!courses){
        return next(new ErrorHandler("Courses Not Found", 404))
    }

    res.status(200).json({
        success: true,
        courses,
    })
})


// controller for getting a new course created 
export const createNewCourse = catchAsyncError(async (req, res, next) => {
    const {title,description,category,price,notes} = req.body;
    const user = await User.findById(req.user._id);
    const file = req.file;
    const fileUri = getDataUri(file);

    // uploading the file to the cloud (cloudinary)
    const posterCloud = await cloudinary.v2.uploader.upload(fileUri.content);

    if(!title || !description || !category || !price) 
        return next(new ErrorHandler('Please fill all the fields',400));

    await Course.create({
        title,description,category,notes,
        price: price,
        createdBy: user._id,
        poster: {
            public_id: posterCloud.public_id,
            url: posterCloud.secure_url,
        },
    })

    res.status(201).json({
        success: true,
        message: "Course created successfully. You can add lectures now",
    })

});


// getting all the lectures of a particular course 
export const getCourseLectures = catchAsyncError(async(req,res,next) => {
    const course = await Course.findById(req.params.id);

    if(!course){
        return next(new ErrorHandler("Course Not Found",404));
    }

    course.views += 1;
    await course.save();

    res.status(200).json({
        success: true,
        lectures: course.lectures
    })
});


