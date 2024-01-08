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
    const {title,description,category,price} = req.body;
    const user = await User.findById(req.user._id);
    const file = req.file;
    const fileUri = getDataUri(file);

    // uploading the file to the cloud (cloudinary)
    const posterCloud = await cloudinary.v2.uploader.upload(fileUri.content);

    if(!title || !description || !category || !price) 
        return next(new ErrorHandler('Please fill all the fields',400));

    await Course.create({
        title,description,category,
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


// controller for adding a new lecture to the course 
export const addNewLecture = catchAsyncError(async(req,res,next) => {
    const course = await Course.findById(req.params.id);
    const {title, description, notes} = req.body;
    const file = req.file;
    
    if(!course){
        return next(new ErrorHandler("Course Not Found", 404));
    }
    
    if(!title || !description || !notes || !file){
        return next(new ErrorHandler("All fields are required", 400));
    }
    
    const fileUri = getDataUri(file);
    const cloud = await cloudinary.v2.uploader.upload(fileUri.content, {
        resource_type: "video"
    });
    
    course.lectures.push({
        title,description,notes,
        video: {
            public_id: cloud.public_id,
            url: cloud.secure_url
        }
    });
    course.numOfVideos = course.lectures.length;
    await course.save();

    res.status(200).json({
        success: true,
        message: "Lecture Added Successfully",
    });
})

// controller for deleting a course
export const deleteACourse = catchAsyncError(async(req,res,next) => {
    const course = await Course.findById(req.params.id);

    if(!course){
        return next(new ErrorHandler("Course Not Found", 404));
    }

    await cloudinary.v2.uploader.destroy(course.poster.public_id);
    for(let i=0; i<course.lectures.length; i++){
        let element = course.lectures[i];
        await cloudinary.v2.uploader.destroy(element.video.public_id, {
            resource_type: "video"
        });
    }

    await course.deleteOne();

    res.status(200).json({
        success: true,
        message: "Course deleted successfully"
    })
});

