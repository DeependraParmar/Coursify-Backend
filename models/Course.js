import mongoose from "mongoose";

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: [true,"Title is required"],
        minLength: [10,"Title must be at least 10 characters long"],
        maxLength: [100,"Title must be at most 100 characters long"],
    },
    description: {
        type: String,
        required: [true,"Description is required"],
        minLength: [10,"Description must be at least 10 characters long"],
    },
    lectures: [
        {
            title: {
                type: String,
                required: [true,"Lecture title is required"],
            },
            description: {
                type: String,
                required: [true,"Lecture description is required"],
            },
            video: {
                public_id: {
                    type: String,
                    required: true,
                },
                url: {
                    type: String,
                    required: true,
                }
            },
            notes: {
                type: String,
            },
        }
    ],
    price: {
        type: Number,
        required: [true,"Price is Required"]
    },
    poster: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        }
    },
    views: {
        type: Number,
        default: 0,
    },
    numOfVideos: {
        type: Number,
        default: 0,
    },
    category: {
        type: String,
        required: [true,"Category is required"],
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true,"Creator's Name is required"],
    },
    totalPurchases: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

export const Course = mongoose.model('Course', schema);