import { catchAsyncError } from "../middlewares/catchAsyncError.js";
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
})