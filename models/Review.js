import mongoose from "mongoose";

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: Number,
        required: [true,"Phone Number is required"],
        minLength: [10,"Phone Number must be 10 digit long"],
        maxLength: [10,"Phone Number must be 10 digit long"]
    },
    resume: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        },
    },
    educationalBackground: {
        type: String,
        required: [true, "Educational Background is required"],
        maxLength: [500, "Educational Background can't be greater than 500 characters"],
    },
    workExperience: {
        type: String,
        required: [true,"Work Experience is required"],
        maxLength: [500, "Work Experience can't be greater than 500 characters"],
    },
    skills: {
        type: String,
        required: [true, "Skill is required"],
        maxLength: [250, "Skills can't be greater than 250 characters"]
    }
});

export const Review = mongoose.model("Reviews", schema);