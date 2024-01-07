import ErrorHandler from "../utils/ErrorHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const isAuthenticated = async(req, res, next) => {
    const token = req.cookies["connect.sid"];

    if(!token){
        return next(new ErrorHandler("Login Required",401));
    }

    const decodedData = jwt.verify(token,process.env.JWT_SECRET);
    req.user = await User.findById(decodedData._id);
    next();
}

export const isVerifiedInstructor = async(req,res,next) => {
    const user = await User.findById(req.user._id);

    if (!user.isVerifiedInstructor || !user.role == "instructor"){
        return next(new ErrorHandler("Unauthorised Access: Instructor Priviledes not available",400));
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


export const isVerifiedCourseUser = async(req,res,next) => {
    next();
}