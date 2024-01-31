import cloudinary from "cloudinary";
import crypto from "crypto";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Course } from "../models/Course.js";
import { InstructorStats } from "../models/InstructorStats.js";
import { Review } from "../models/Review.js";
import User from "../models/User.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import getDataUri from "../utils/dataUri.js";
import { sendEmail } from "../utils/sendMail.js";
import { sendToken } from "../utils/sendToken.js";

// controller to register a user 
export const register = catchAsyncError(async (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
        return (next(new ErrorHandler("All the fields are required", 400)));

    let user = await User.findOne({ email });

    if (user)
        return next(new ErrorHandler("User Already Exists. Please go to Login", 409));


    user = await User.create({
        name, email, password,
        avatar: {
            public_id: "default",
            url: "https://asset.cloudinary.com/dmmrtqe8q/bd8f69b303633e784950d90b22da09a6"
        }
    });

    sendToken(res, user, "User Registered Successfully", 201);
});



// controller to login a  user 
export const login = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler("All Fields are Required", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorHandler("User Doesn't Exist. Please Register First", 401));
    }

    const isMatched = await user.comparePassword(password);

    if (!isMatched)
        return next(new ErrorHandler("Incorrect Email or Password", 401));


    sendToken(res, user, `Welcome back, ${user.name}`, 200)
});



// getting the profile of the user
export const myProfile = catchAsyncError(async (req, res, next) => {
    res.send({
        success: true,
        user: req.user,
    });
});

// getting the public profile of thè user 
export const getPublicProfile = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const dbUser = await User.findById(id);

    if (!dbUser) {
        return next(new ErrorHandler("User not found!", 404));
    }

    let createdCourses = [];

    if(dbUser.isVerifiedInstructor){
        createdCourses = await Course.find({createdBy: dbUser._id});
    }

    res.status(200).json({
        success: true,
        user: {
            name: dbUser.name,
            email: dbUser.email,
            avatar: dbUser.avatar,
            courses: createdCourses,
        }
    })
})

// updating the profile details of the user: name,email and about
export const updateProfile = catchAsyncError(async (req, res, next) => {
    const { name, email, about, phoneNumber } = req.body;
    const user = await User.findById(req.user._id);

    if (name) {
        user.name = name;
    }
    if (email) {
        user.email = email;
    }
    if (about) {
        user.about = about;
    }
    if (phoneNumber) {
        user.phoneNumber = phoneNumber;
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
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
        return next(new ErrorHandler("User Doesn't Exist. Please Register First", 401));
    }

    const isMatched = await user.comparePassword(oldPassword);

    if (!isMatched)
        return next(new ErrorHandler("Incorrect Old Password", 401));

    user.password = newPassword;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Password Updated Successfully",
    })
});

// controller for forgot password
// controller for forget password 
export const forgetPassword = catchAsyncError(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new ErrorHandler("Email is Required", 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
        return next(new ErrorHandler("User not found with this email", 404));
    }

    const resetToken = await user.getResetToken();

    await user.save();

    const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
    const message = `Click on the link to reset your password: ${url}. If your have not requested then, please ignore.`

    // send token via email 
    await sendEmail(user.email, "Coursify: Forgot Password!! No Worries. Reset it", message);

    res.status(200).json({
        success: true,
        message: `Reset link has been sent to ${user.email}`
    })
});

// resetting the user password from tokenisation 
// controller for reset password 
export const resetPassword = catchAsyncError(async (req, res, next) => {
    const { token } = req.params;

    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {
            $gt: Date.now(),
        }
    });

    if (!user) {
        return next(new ErrorHandler("Token is invalid or been expired", 401));
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

export const registerAsInstructor = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    const { phoneNumber, educationalBackground, workExperience, skills } = req.body;
    const file = req.file;

    if (!phoneNumber || !educationalBackground || !workExperience || !skills || !file) {
        return next(new ErrorHandler("All fields are required", 400));
    }

    try {
        const fileUri = getDataUri(file);
        const cloud = await cloudinary.v2.uploader.upload(fileUri.content);

        await Review.create({
            name: user.name,
            email: user.email,
            phoneNumber,
            resume: {
                public_id: cloud.public_id,
                url: cloud.secure_url
            },
            educationalBackground,
            workExperience,
            skills
        });

        res.status(200).json({
            success: true,
            message: "Your Request is successfully submitted for Review. You will be notified within 5-14 working days.",
        });
    } catch (error) {
        // Handle any errors that might occur during the process
        return next(new ErrorHandler("Error submitting review request", 500));
    }
});


// get all the courses bought by the user 
export const getMyCourses = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);

    res.status(200).json({
        success: true,
        myCourses: user.courses
    });
});


// get all the courses created by the user
export const getCreatedCourses = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    const userId = user._id;

    const myCourses = await Course.find({ createdBy: userId });

    if (!myCourses) {
        return next(new ErrorHandler("No Courses created yet", 400));
    }

    res.status(200).json({
        success: true,
        myCourses
    })
})

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

// controller for getting the instructor stats
User.watch().on("change", async (req, res, next) => {
    const stats = [];
    try {
        const instructor = await User.findById(req.user._id);
        if (!instructor) {
            return new ErrorHandler("Instructor not found", 404);
        }
        stats = await InstructorStats.find({ instructorId: instructor._id }).sort({ createdAt: "desc" }).limit(1);
    }
    catch (error) {
        return new ErrorHandler("Error getting instructor stats", 500);
    }

    const statsData = stats[0].metrics;

    const courses = await Course.find({ createdBy: req.user._id });
    statsData.totalCourses = await Course.countDocuments({ createdBy: req.user._id });
    statsData.totalStudentsEnrolled = await Course.find({ createdBy: req.user._id }).countDocuments();
    statsData.totalEarnings = courses.reduce((total, course) => total + (course.totalPurchases * course.price), 0);
    statsData.createdAt = new Date(Date.now());

    await stats[0].save();
});