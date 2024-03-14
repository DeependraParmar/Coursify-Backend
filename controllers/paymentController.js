import { Course } from "../models/Course.js";
import User from "../models/User.js";
import { instance } from "../server.js"
import crypto from "crypto";
import { Payment } from "../models/Payment.js"

export const checkOut = async(req,res,next) => {
    const options = {
        amount: Number(req.body.amount * 100),
        currency: 'INR',
    }

    const order = await instance.orders.create(options);
    res.status(200).json({
        success: true,
        message: "Order created successfully....",
        order
    })
}

export const paymentVerification = async (req, res, next) => {
    const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body;
    const user = await User.findById(req.user._id);
    const course = await Course.findById(req.params.course_id);

    if(!course){
        return next(new ErrorHandler("Course Not Found", 404));
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_API_SECRET).update(body.toString()).digest('hex')

    const isAuthenticSignature = expectedSignature === razorpay_signature;

    if(isAuthenticSignature){
        // save all the things to the database 
        await Payment.create({
            razorpay_order_id,razorpay_payment_id,razorpay_signature
        });
        user.courses.push({
            course: req.params.course_id,
            thumbnail: course.poster.public_id,
        });
        course.totalPurchases += 1;
        await user.save();
        res.redirect(`${process.env.FRONTEND_URL}/paymentsuccess?reference=${razorpay_payment_id}`)
    }
    else{
        res.redirect(`${process.env.FRONTEND_URL}/paymentfailed?reference=${razorpay_payment_id}`)
    }


    res.status(200).json({
        success: true,
        message: "Course Bought Successfully",
        courses: user.courses,
    })
}

export const getRazorpayKey = async(req,res,next) => {
    res.status(200).json({
        key: process.env.RAZORPAY_API_KEY
    });
}