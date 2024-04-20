import {catchAsyncError} from "../middlewares/catchAsyncError.js"
import ErrorHandler from "../utils/ErrorHandler.js";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "cloudinary";
import { Dropbox } from "../models/Dropbox.js";

export const uploadToDropbox = catchAsyncError( async(req,res, next) => {
    const file = req.file;

    if(!file){
        return next(new ErrorHandler("Please upload a file", 400));
    }

    const uri = getDataUri(file);
    const cloud = await cloudinary.v2.uploader.upload(uri.content);

    await Dropbox.create({
        image: {
            public_id: cloud.public_id,
            url: cloud.secure_url,
        }
    });

    res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
    });
});

export const getFromDropbox = catchAsyncError(async(req,res,next) => {
    const images = await Dropbox.find({}).sort({ KEY: -1});

    if(!images){
        return next(new ErrorHandler("No Images Found", 404));
    }

    res.status(200).json({
        success: true,
        images
    });
});

export const deleteFromDropbox = catchAsyncError(async(req,res,next) => {
    const image = await Dropbox.findById(req.params.id);

    if(!image){
        return next(new ErrorHandler("Image Not Found", 404));
    }

    await cloudinary.v2.uploader.destroy(image.image.public_id);
    await image.deleteOne();

    res.status(200).json({
        success: true,
        message: "Image deleted successfully",
    });
});