import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import passport from "passport";
import { sendToken } from "../utils/sendToken.js";
import User from "../models/User.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "cloudinary";
import crypto from "crypto";
import { sendEmail } from "../utils/sendMail.js";

// controller to register a user 
export const register = catchAsyncError( async(req,res,next) => {
    const {name,email,password} = req.body;

    if( !name || !email || !password)
        return (next(new ErrorHandler("All the fields are required",400)));

    let user = await User.findOne({email});

    if(user) 
        return next(new ErrorHandler("User Already Exists. Please go to Login",409));


    user = await User.create({
        name,email,password,
        avatar: {
            public_id: "default",
            url: "https://res.cloudinary.com/dxkufsejm/image/upload/v1628058633/default.png"
        }
    });

    sendToken(res,user,"User Registered Successfully",201);
});



// controller to login a  user 
export const login = catchAsyncError(async(req,res,next)=> {
    const {email,password} = req.body;

    if( !email || !password){
        return next(new ErrorHandler("All Fields are Required", 400));
    }

    const user = await User.findOne({email}).select("+password");

    if(!user){
        return next(new ErrorHandler("User Doesn't Exist. Please Register First", 401));
    }

    console.log(user);
    const isMatched = await user.comparePassword(password);

    if(!isMatched)
        return next(new ErrorHandler("Incorrect Email or Password",401));


    sendToken(res,user,`Welcome back, ${user.name}`,200)
});

// ********************* CONTROLLER FOR GOOGLE AUTHENTICATION ********************
// controller for the google authentication at /api/v1/auth/google
export const googleAuthController = (passport.authenticate("google", {
    scope: ["profile", "email"],
}));

// google login callback controller for the route /api/v1/auth/google/callback
export const googleAuthCallbackController = (passport.authenticate("google", {
    failureRedirect: "/api/v1/auth/google/error",
    successRedirect: "/api/v1/auth/google/success"
}));

// controller for the /success route 
export const googleAuthSuccessController = (passport.authenticate("google", {}), async(req,res,next) => {
    res.send("<h1>Google Authentication Successfull</h1> <br> <a href='/api/v1/profile'>Go to profile</a> <br> <a href='/api/v1/logout'>Logout</a>")
});

// controller for the /error route 
export const googleAuthErrorController = catchAsyncError(async (req,res,next) => {
    res.send("<h1>Google Authentication Failed</h1> <br> <a href='/'>Go to home</a> <br> <a href='/auth/google'>Login with Google</a>")
});


// getting the profile of the user
export const myProfile = catchAsyncError(async (req, res, next) => {
    res.send({
        success: true,
        user: req.user,
    });
});

// updating the profile details of the user: name,email and about
export const updateProfile = catchAsyncError( async(req,res,next) => {
    const {name,email,about} = req.body;
    const user = await User.findById(req.user._id);

    if(name){
        user.name = name;
    }
    if(email){
        user.email = email;
    }
    if(about){
        user.about = about;
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: "Profile Updated Successfully",
    })
});

// updating the profile picture of the user 
// controller for updating the profile picture 
export const updateProfilePicture = catchAsyncError(async (req, res, send) => {
    const user = await User.findById(req.user._id);
    const file = req.file;
    const fileUri = getDataUri(file);
    const cloud = await cloudinary.v2.uploader.upload(fileUri.content);

    //destroying the older picture
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    // updating the profile picture 
    user.avatar = {
        public_id: cloud.public_id,
        url: cloud.secure_url,
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: "Profile Picture Updated Successfully",
    })
});

// changing the password of the user
export const changePassword = catchAsyncError(async (req, res, next) => {
    const {oldPassword, newPassword} = req.body;
    const user = await User.findById(req.user._id).select("+password");

    if(!user){
        return next(new ErrorHandler("User Doesn't Exist. Please Register First", 401));
    }

    const isMatched = await user.comparePassword(oldPassword);

    if(!isMatched)
        return next(new ErrorHandler("Incorrect Old Password",401));

    user.password = newPassword;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Password Updated Successfully",
    })
});

// controller for forgot password
// controller for forget password 
export const forgetPassword = catchAsyncError( async(req,res,next) => {
    const {email} = req.body;
    if(!email){
        return next(new ErrorHandler("Email is Required",400));
    }
    
    const user = await User.findOne({email});

    if(!user){
        return next(new ErrorHandler("User not found with this email",404));
    }

    const resetToken = await user.getResetToken();

    await user.save();

    const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
    const message = `Click on the link to reset your password: ${url}. If your have not requested then, please ignore.`

    // send token via email 
    await sendEmail(user.email,"Coursify: Forgot Password!! No Worries. Reset it",message);

    res.status(200).json({
        success: true,
        message: `Reset link has been sent to ${user.email}`
    })
});

// resetting the user password from tokenisation 
// controller for reset password 
export const resetPassword = catchAsyncError( async(req,res,next) => {
    const {token} = req.params;

    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {
            $gt: Date.now(),
        }
    });

    if(!user){
        return next(new ErrorHandler("Token is invalid or been expired",401));
    }

    user.password = req.body.password;
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Password Reset Successful",
    })
});


// logging the user out
export const logout = catchAsyncError((req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            return next(err);
        }
        res.clearCookie("connect.sid");
        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        })
    })
});
