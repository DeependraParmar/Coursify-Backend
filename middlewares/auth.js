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