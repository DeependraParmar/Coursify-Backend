import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Course } from "../models/Course.js";
import { InstructorStats } from "../models/InstructorStats.js";
import User from "../models/User.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { sendEmail } from "../utils/sendMail.js";

export const changeRole = catchAsyncError(async(req,res,next) => {
    const user = await User.findById(req.user._id);

    if(user.role === "user" && user.isVerifiedInstructor == true){
        user.role = "instructor"
    }
    else{
        user.role = "user"
    }

    await user.save();
    res.redirect(`${process.env.FRONTEND_URL}/api/v1/instructor`)
});


export const contact = catchAsyncError( async(req,res,next) => {
    const {name, email, message} = req.body;

    if(!name || !email || !message){
        return next(new ErrorHandler("All fields are required", 400));
    }

    const to = process.env.MY_MAIL;
    const subject = "Contact from Coursify";
    const text = `Hello, I am ${name}, my email is ${email}. ${message}`

    await sendEmail(to,subject,text);

    res.status(200).json({
        success: true,
        message: "We got your message and we'll get in touch with you asap"
    });
});

export const getPublicProfile = catchAsyncError( async(req,res,next) => {
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler("Public Profile Not Found", 404));
    }

    res.status(200).json({
        success: true,
        user,
    });
})


// controller for getting the stats for the instructor 
export const getInstructorStats = catchAsyncError(async (req, res, next) => {
    const instructor = await User.findById(req.user._id);
    const stats = await InstructorStats.find({ instructorId: instructor._id })
        .sort({ createdAt: "desc" })
        .limit(12);


    const statsData = stats.map((stat) => ({
        totalCourses: stat.metrics[0].totalCourses,
        totalStudentsEnrolled: stat.metrics[0].totalStudentsEnrolled,
        views: stat.metrics[0].views,
        totalEarnings: stat.metrics[0].totalEarnings,
    }));

    const reqSize = 12 - stats.length;

    for (let i = 0; i < reqSize; i++) {
        statsData.unshift({
            totalCourses: 0,
            totalStudentsEnrolled: 0,
            views: 0,
            totalEarnings: 0,
        });
    }

    let userCount = statsData[11].totalStudentsEnrolled;
    let courseCount = statsData[11].totalCourses;
    let viewCount = statsData[11].views;
    let earningCount = statsData[11].totalEarnings;

    let userProfit = true, viewProfit = true, earningProfit = true;
    let userPercent = 0, viewPercent = 0, earningPercent = 0;

    if (statsData[10].totalStudentsEnrolled === 0) {
        userPercent = userCount * 100;
    } else {
        const difference = userCount - statsData[10].totalStudentsEnrolled;
        userPercent = (difference / statsData[10].totalStudentsEnrolled) * 100;
        if (userPercent < 0) userProfit = false;
    }

    if (statsData[10].views === 0) {
        viewPercent = viewCount * 100;
    } else {
        const difference = viewCount - statsData[10].views;
        viewPercent = (difference / statsData[10].views) * 100;
        if (viewPercent < 0) viewProfit = false;
    }

    if (statsData[10].totalEarnings === 0) {
        earningPercent = earningCount * 100;
    } else {
        const difference = earningCount - statsData[10].totalEarnings;
        earningPercent = (difference / statsData[10].totalEarnings) * 100;
        if (earningPercent < 0) earningProfit = false;
    }

    

    res.status(200).json({
        success: true,
        stats: statsData,
        userCount,
        courseCount,
        viewCount,
        earningCount,
        userProfit,
        viewProfit,
        earningProfit,
        userPercent,
        viewPercent,
        earningPercent,
    });
});


// controller for getting the user and the instructor count 
export const getAdminStatsCount = catchAsyncError( async(req,res,next) => {
    const userCount = await User.countDocuments();
    const instructorCount = await User.countDocuments({isVerifiedInstructor: true});
    const coursesCount = await Course.countDocuments();

    res.status(200).json({
        success: true,
        userCount,
        instructorCount,
        coursesCount,
    })
});

export const getAdminDashboardData = catchAsyncError( async(req,res,next) => {
    const users = await User.find({isVerifiedInstructor: false, isVerifiedAdmin: false});
    const instructors = await User.find({isVerifiedInstructor: true});

    res.status(200).json({
        success: true,
        users,
        instructors,
    });
});

export const getTotalAdminStatEarning = catchAsyncError( async(req,res,next) => {
    const courses = await Course.find({});
    let totalEarning = 0;

    for(let i=0; i<courses.length; i++){
        totalEarning += (courses[i].totalPurchases * courses[i].price);
    }

    res.status(200).json({
        success: true,
        totalEarning,
    })
})