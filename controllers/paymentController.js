import { Course } from "../models/Course.js";
import User from "../models/User.js";
import { instance } from "../server.js"
import crypto from "crypto";
import { Payment } from "../models/Payment.js"
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/ErrorHandler.js";

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
        await Payment.create({
            razorpay_order_id,razorpay_payment_id,razorpay_signature,
            user: {
                name: user.name,
                email: user.email,
                phone: user.phoneNumber || "Not Provided"
            },
            transaction_amount: course.price,
            course: {
                name: course.title,
                creator: course.createdBy,
                price: course.price,
                id: course._id
            },
        });
        user.courses.push({
            course: req.params.course_id,
            thumbnail: course.poster.url,
            title: course.title,
        });
        course.totalPurchases += 1;
        await user.save();
        await course.save();
        return res.redirect(`${process.env.FRONTEND_URL1}/paymentsuccess?reference=${razorpay_payment_id}`)
    }
    else{
        return res.redirect(`${process.env.FRONTEND_URL1}/paymentfailed?reference=${razorpay_payment_id}`)
    }
}

export const isValidPayment = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;

    const payment = await Payment.findOne({ razorpay_payment_id: id });

    if (!payment) {
        return next(new ErrorHandler("Invalid Payment", 404));
    }

    res.status(200).json({
        success: true,
        message: "Transaction Verified...."
    });
});

export const getRazorpayKey = async(req,res,next) => {
    res.status(200).json({
        key: process.env.RAZORPAY_API_KEY
    });
}