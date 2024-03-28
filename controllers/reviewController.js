import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Review } from "../models/Review.js";
import User from "../models/User.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import cloudinary from "cloudinary";


export const getReviewRequests = catchAsyncError( async(req,res,next) => {
    const requests = await Review.find({});

    if(!requests){
        return next(new ErrorHandler("No Review Requests found", 404));
    }

    res.status(200).json({
        success: true,
        requests
    })
});

export const approveInstructorRequest = catchAsyncError( async(req,res,next) => {
    const reviewRequestId = req.params.id;

    if(!reviewRequestId){
        return next(new ErrorHandler("Invalid Review Request", 400));
    }

    const request = await Review.findById(reviewRequestId);
    const user = await User.find({email: request.email});

    user[0].isVerifiedInstructor = true;

    await user[0].save();

    // destroying the resume sent by the instructor from the cloud
    await cloudinary.v2.uploader.destroy(request.resume.public_id,{
        resource_type: "image"
    })

    await request.deleteOne();

    res.status(200).json({
        success: true,
        message: `Review Request id: ${reviewRequestId} approved successfully`
    })
})

// for discarding the instructor's request for review.
export const discardInstructorRequest = catchAsyncError( async(req,res,next) => {
    const reviewRequestId = req.params.id;

    if(!reviewRequestId){
        return next(new ErrorHandler("Invalid Review Request", 400));
    }

    const request = await Review.findById(reviewRequestId);
    const user = await User.find({email: request.email});

    if(!user){
        return next(new ErrorHandler("Requesting User not found", 400));
    }

    user[0].isVerifiedInstructor = false;

    await user[0].save();

    // destroying the resume sent by the instructor from the cloud
    await cloudinary.v2.uploader.destroy(request.resume.public_id,{
        resource_type: "image"
    })

    await request.deleteOne();

    res.status(200).json({
        success: true,
        message: `Review Request id: ${reviewRequestId} discarded successfully`
    })
})