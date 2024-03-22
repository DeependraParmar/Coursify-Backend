import mongoose from "mongoose"

const schema = new mongoose.Schema({
    razorpay_order_id: {
        type: String,
        required: true
    },
    razorpay_payment_id: {
        type: String,
        required: true
    },
    razorpay_signature: {
        type: String,
        required: true
    },
    transaction_date: {
        type: Date,
        required: true,
        default: new Date(Date.now()).toDateString(),
    },
    invoice_no: {
        type: String,
        required: true,
        unique: true,
        default: `INV-${Date.now()}`
    },
    user: {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        }
    },
    transaction_amount: {
        type: Number,
        required: true
    },
    course: {
        name: {
            type: String,
            required: true
        },
        creator: {
            type: String,
            required: true
        }
    }
});

export const Payment = mongoose.model("Payments", schema);