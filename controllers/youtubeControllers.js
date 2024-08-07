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

export const getSpecificFreeCourse = catchAsyncError( async(req, res, next) => {
    const course = await Youtube.findById(req.params.id);

    if(!course)
        return next(new ErrorHandler("Course not found", 404));

    res.status(200).json({
        success: true,
        course
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

    for(let i=0; i<course.lectures.length; i++){
        await cloudinary.v2.uploader.destroy(course.lectures[i].thumbnail.public_id);
    }

    await course.deleteOne();

    res.status(200).json({
        success: true,
        message: "Course deleted successfully",
    });
});


export const addLectureToFreeCourse = catchAsyncError( async(req, res, next) => {
    const { title, description, url} = req.body;
    const file = req.file;
    const course = await Youtube.findById(req.params.id);

    if(!course)
        return next(new ErrorHandler("Course not found", 404));

    if(!title || !description || !file)
        return next(new ErrorHandler("Please enter all the fields", 400));

    const fileUri = getDataUri(file);
    const cloud = await cloudinary.v2.uploader.upload(fileUri.content);

    course.lectures.push({
        thumbnail: {
            public_id: cloud.public_id,
            url: cloud.secure_url,
        },
        title, description, url,
    });

    await course.save();

    res.status(200).json({
        success: true,
        message: "Lecture added successfully",
    });
});

export const getSpecificCourseLecture = catchAsyncError( async(req, res, next) => {
    const course = await Youtube.findById(req.params.id);

    if(!course)
        return next(new ErrorHandler("Course Not Found", 404));
    
    const lecture = course.lectures.filter(lecture => lecture._id.toString() === req.params.lectureid.toString());
    
    if(lecture.length === 0)
        return next(new ErrorHandler("Lecture Not Found", 404));

    res.status(200).json({
        success: true,
        lecture: lecture[0]
    });
})

export const editSpecificCourseLecture = catchAsyncError( async(req, res, next) => {
    const { title, description, url} = req.body;
    const file = req.file;
    const course = await Youtube.findById(req.params.id);

    if(!course)
        return next(new ErrorHandler("Course not found", 404));

    const lecture = course.lectures.id(req.params.lectureid);

    if(!lecture)
        return next(new ErrorHandler("Lecture not found", 404));

    if(file){
        await cloudinary.v2.uploader.destroy(lecture.thumbnail.public_id);
        const fileUri = getDataUri(file);
        const cloud = await cloudinary.v2.uploader.upload(fileUri.content);

        lecture.thumbnail = {
            public_id: cloud.public_id,
            url: cloud.secure_url,
        }
    }
    
    if(title)
        lecture.title = title;

    if(description)
        lecture.description = description;

    if(url)
        lecture.url = url;

    await course.save();

    res.status(200).json({
        success: true,
        message: "Lecture updated successfully",
    });
});

export const deleteLecture = catchAsyncError( async(req, res, next) => {
    const {id, lectureid} = req.params;
    const course = await Youtube.findById(id);

    if(!course)
        return next(new ErrorHandler("Course not found", 404));

    // deleting the thumnail of the lecture
    const lecture = course.lectures.filter(lecture => lecture._id.toString() === lectureid.toString());
    await cloudinary.v2.uploader.destroy(lecture[0].thumbnail.public_id);

    // updating the course by excluding that particular lecture.
    course.lectures = course.lectures.filter(lecture => lecture._id.toString() !== lectureid.toString());

    await course.save();

    res.status(200).json({
        success: true,
        message: "Lecture deleted successfully",
    });
});