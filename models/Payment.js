import mongoose, { Types } from "mongoose"

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
        default: Date.now,
    },
    invoice_no: {
        type: String,
        default: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`
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
        },
        price: {
            type: Number,
            required: true
        },
        id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        }
    }
});

export const Payment = mongoose.model("Payments", schema);