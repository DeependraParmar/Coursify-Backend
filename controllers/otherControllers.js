import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Review } from "../models/Review.js";
import User from "../models/User.js";
import ErrorHandler from "../utils/ErrorHandler.js";

export const changeRole = catchAsyncError(async(req,res,next) => {
    const user = await User.findById(req.user._id);

    if(user.role === "user" && user.isVerifiedInstructor == True){
        user.role = "instructor"
    }
    else{
        user.role = "user"
    }

    await user.save();
});


export const getReviewRequests = catchAsyncError( async(req,res,next) => {
    const requests = await Review.find({});

    if(!requests){
        return next(new ErrorHandler("No Review Requests found", 404));
    }

    res.status(200).json({
        success: true,
        requests
    })
})