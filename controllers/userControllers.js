import cloudinary from "cloudinary";
import crypto from "crypto";
import ejs from "ejs";
import path from "path";
import puppeter from "puppeteer";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Course } from "../models/Course.js";
import { InstructorStats } from "../models/InstructorStats.js";
import { Payment } from "../models/Payment.js";
import { PreRegister } from "../models/PreRegister.js";
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

    const otp = Math.floor(100000 + Math.random() * 900000);

    user = null;
    user = await PreRegister.findOne({ email }); 

    if(user){
        user.name = name;
        user.password = password;
        user.otp = otp;
        await user.save();
    }
    else{
        user = await PreRegister.create({
            name, email, password, otp
        });
    }

    const emailTemplatePath = path.join(process.cwd(), "views", "otpTemplate.ejs");
    const emailTemplate = await ejs.renderFile(emailTemplatePath, {
        otp: otp,
    });

    let mailOptions = {
        to: email,
        from: `Coursify🚀 ${process.env.MY_MAIL}`,
        subject: "Complete signing up for Coursify by verifying your email with this OTP",
        html: emailTemplate,
    }

    await sendEmail(mailOptions);

    res.status(200).json({
        success: true,
        message: "OTP sent to mail. Please verify your email to register."
    })
});

export const verifyRegister = catchAsyncError(async (req, res, next) => {
    const { name, email, password, otp } = req.body;

    if(!name || !email || !password || !otp){
        return next(new ErrorHandler("All fields are required", 400));
    }

    let user = await PreRegister.findOne({ email });

    if(!user){
        return next(new ErrorHandler("User not found", 404));
    }

    if(user.otp !== otp){
        return next(new ErrorHandler("Invalid OTP", 400));
    }

    await PreRegister.deleteOne({ email });

    user = await User.create({
        name, email, password,
        avatar: {
            public_id: "default",
            url: "https://res.cloudinary.com/dmmrtqe8q/image/upload/v1711593819/user.png"
        }
    });

    const emailTemplatePath = path.join(process.cwd(), "views", "welcome.ejs");
    const emailTemplate = await ejs.renderFile(emailTemplatePath, {
        user: user.name,
    });

    let mailOptions = {
        to: user.email,
        from: `Coursify🚀 ${process.env.MY_MAIL}`,
        subject: "Welcome to Coursify! 🚀🌟",
        html: emailTemplate,
    }

    await sendEmail(mailOptions);

    sendToken(res, user, "Registration Successfull", 201);
});

// receipt generation
export const htmlToPdf = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;

    const payment = await Payment.findOne({ razorpay_payment_id: id });
    
    if(!payment){
        return next(new ErrorHandler("Invalid ID or Payment", 411));
    }

    const receiptPath = path.join(process.cwd(), "views", "receipt.ejs");
    const receipt = await ejs.renderFile(receiptPath, {
        transaction_date: new Date(payment.transaction_date).toDateString().toString(),
        transaction_id: payment.razorpay_payment_id,
        invoice_id: payment.invoice_no,
        username: payment.user.name,
        useremail: payment.user.email,
        userphone: payment.user.phone,
        course: payment.course.name,
        creator: payment.course.creator,
        price: payment.course.price,
    });

    const browser = await puppeter.launch();
    const page = await browser.newPage();

    await page.setContent(receipt, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="Receipt.pdf" ');

    // making pdf accessible on mobile devices as well: added later on
    res.setHeader('Content-Transfer-Encoding', 'binary');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
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

    if (dbUser.isVerifiedInstructor) {
        createdCourses = await Course.find({ createdBy: dbUser._id });
    }

    res.status(200).json({
        success: true,
        user: {
            id: dbUser._id,
            name: dbUser.name,
            email: dbUser.email,
            avatar: dbUser.avatar,
            about: dbUser.about,
            social: {
                linkedin: dbUser.linkedin,
                twitter: dbUser.twitter,
                github: dbUser.github,
                facebook: dbUser.facebook,
                website: dbUser.website,
                youtube: dbUser.youtube,
            },
            courses: createdCourses,
        }
    })
})

// updating the profile details of the user: name,email and about
export const updateProfile = catchAsyncError(async (req, res, next) => {
    const { name, email, about, phoneNumber, linkedin, twitter, github, facebook, website, youtube } = req.body;
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
    if (linkedin) {
        user.linkedin = linkedin;
    }
    if (twitter) {
        user.twitter = twitter;
    }
    if (github) {
        user.github = github;
    }
    if (facebook) {
        user.facebook = facebook;
    }
    if (website) {
        user.website = website;
    }
    if (youtube) {
        user.youtube = youtube;
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
    if(user.avatar.public_id !== "default"){
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    }

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

    if (oldPassword === newPassword) {
        return next(new ErrorHandler("New Password cannot be same as old password", 400));
    }

    user.password = newPassword;
    await user.save();

    const emailTemplatePath = path.join(process.cwd(), "views", "passwordChanged.ejs");
    const emailTemplate = await ejs.renderFile(emailTemplatePath, {
        user: user.name,
        time: new Date(Date.now()).toLocaleTimeString(),
        date: new Date(Date.now()).toDateString(),
    });

    let mailOptions = {
        to: user.email,
        from: `Coursify🚀 ${process.env.MY_MAIL}`,
        subject: "Password Reset Successfull | Full Protection Mode ON! 🛡️",
        html: emailTemplate,
    }

    await sendEmail(mailOptions);

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
    
    const emailTemplatePath = path.join(process.cwd(), "views", "resetPassword.ejs");
    const emailTemplate = await ejs.renderFile(emailTemplatePath, {
        link: url,
    });

    let mailOptions = {
        to: email,
        from: `Coursify🚀 ${process.env.MY_MAIL}`,
        subject: "Forgot Password, No Worries. Reset it!",
        html: emailTemplate,
    }

    await sendEmail(mailOptions);

    // send token via email 
    await await sendEmail(mailOptions);

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
    }).select("+password");

    if (!user) {
        return next(new ErrorHandler("Token is invalid or been expired", 401));
    }

    const { password } = req.body;

    const isMatched = await user.comparePassword(password);

    if (isMatched)
        return next(new ErrorHandler("Cannot keep New Password as same as Old Password", 401));

    user.password = password;
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;

    await user.save();

    const emailTemplatePath = path.join(process.cwd(), "views", "passwordChanged.ejs");
    const emailTemplate = await ejs.renderFile(emailTemplatePath, {
        user: user.name,
        date: new Date(Date.now()).toDateString(),
    });

    let mailOptions = {
        to: user.email,
        from: `Coursify🚀 ${process.env.MY_MAIL}`,
        subject: "Password Reset Successfull | Full Protection Mode ON! 🛡️",
        html: emailTemplate,
    }

    await sendEmail(mailOptions);

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
        const review = await Review.findOne({email: user.email });

        if(review){
            return next(new ErrorHandler("Review is already submitted and is under verification..", 400));
        }

        if(user.isVerifiedInstructor){
            return next(new ErrorHandler("You are already a verified instructor", 400));
        }

        const fileUri = getDataUri(file);
        const cloud = await cloudinary.v2.uploader.upload(fileUri.content);

        await Review.create({
            requesteeId: user._id,
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
            message: "Your Request is successfully submitted for Review. You will be notified within 1-3 working days.",
        });
    } catch (error) {
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
});

// logging the user out
// Logout route
export const logout = catchAsyncError((req, res, next) => {
    res.clearCookie("connect.sid", {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
    });
    req.session.destroy(() => {
        res.status(200).json({
            success: true,
            message: "Logged Out Successfully"
        });
    });
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