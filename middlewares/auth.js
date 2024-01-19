import ErrorHandler from "../utils/ErrorHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const isAuthenticated = async(req, res, next) => {
    const token = req.cookies['connect.sid'];

    if(!token){
        return next(new ErrorHandler("Login Required",401));
    }

    const decodedData = jwt.verify(token,process.env.JWT_SECRET,{algorithm: ['HS256']});
    req.user = await User.findById(decodedData._id);
    next();
}

export const isVerifiedInstructor = async(req,res,next) => {
    const user = await User.findById(req.user._id);

    if (!user.isVerifiedInstructor || !user.role == "instructor"){
        return next(new ErrorHandler("Unauthorised Access: Instructor Privileges not available",400));
    }

    next();
}

export const isVerifiedAdmin = async(req,res,next) => {
    const user = await User.findById(req.user._id);
    const verifiedAdmin = user.isVerifiedAdmin && user.role == "admin";

    if(!verifiedAdmin){
        return next(new ErrorHandler("Unauthorised Access: Admin privileges not available", 400))
    }

    next();
}

// checking whether the user is having or purchased the course or not
export const isVerifiedCourseUser = async(req,res,next) => {
    const user = await User.findById(req.user._id);
    const courseId = req.params.id;

    let isFound = false;
    for(let i=0; i<user.courses.length; i++){
        if(courseId == user.courses[i].course){
            isFound = true;
            break;
        }
    }

    if(isFound == false){
        return next(new ErrorHandler("Unauthorised Access: Purchase the course to watch", 400));
    }
    next();
}