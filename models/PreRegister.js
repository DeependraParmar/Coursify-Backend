import mongoose from "mongoose";
import validator from "validator";

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a name"],
        maxlength: [30, "Name cannot be more than 30 characters"]
    },
    email: {
        type: String,
        required: [true, "Please provide an email"],
        unique: true,
        validate: [validator.isEmail, "Please provide a valid email"]
    },
    password: {
        type: String,
        minLength: [6, "Password must be at least 6 characters long"],
        select: false,
    },
    otp: {
        type: String,
    },
});

export const PreRegister = mongoose.model("PreRegister", schema);