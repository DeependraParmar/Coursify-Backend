import mongoose from "mongoose";

const instructorStatsSchema = new mongoose.Schema({
    instructorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    metrics: {
        totalCourses: {
            type: Number,
            default: 0,
        },
        totalStudentsEnrolled: {
            type: Number,
            default: 0,
        },
        totalEarnings: {
            type: Number,
            default: 0,
        },
        views: {
            type: Number,
            default: 0,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        }
    },
});

export const InstructorStats = mongoose.model('InstructorStats', instructorStatsSchema);
