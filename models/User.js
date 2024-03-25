import mongoose from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

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
        lowercase: true,
        validate: [validator.isEmail, "Please provide a valid email"]
    },
    phoneNumber: {
        type: Number,
        minLength: [10, "Phone Number must be 10 digit long"],
        maxLength: [10, "Phone Number must be 10 digit long"],
    },
    password: {
        type: String,
        minLength: [6, "Password must be at least 6 characters long"],
        select: false,
    },
    isVerifiedInstructor: {
        type: Boolean,
        default: false,
    },
    isVerifiedAdmin: {
        type: Boolean,
        default: false,
    },
    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        },
    },
    courses: [
        {
            course: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course'
            },
            thumbnail: {
                type: String,
                required: true
            },
            title: {
                type: String,
                required: true
            },
        }
    ],
    about: {
        type: String,
        maxlength: [500, "About cannot be more than 500 characters"]
    },
    linkedin: {
        type: String,
        validate: [validator.isURL, "Please provide a valid URL"]
    },
    twitter: {
        type: String,
        validate: [validator.isURL, "Please provide a valid URL"]
    },
    facebook: {
        type: String,
        validate: [validator.isURL, "Please provide a valid URL"]
    },
    youtube: {
        type: String,
        validate: [validator.isURL, "Please provide a valid URL"]
    },
    github: {
        type: String,
        validate: [validator.isURL, "Please provide a valid URL"]
    },
    website: {
        type: String,
        validate: [validator.isURL, "Please provide a valid URL"]
    },
    notifications: [
        {
            emoji: {
                type: String,
                default: "😍"
            },
            title: {
                type: String,
                default: "Welcome to Coursify🌟✨🔥"
            },
            description: {
                type: String,
                default: "Learn from the masters and upskill yourself"
            },
            madeFor: {
                type: String,
                enum: ["user", "instructor"],
                default: "user",
            },
            generatedOn: {
                type: Date,
                default: Date.now
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    otp: {
        type: Number,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
});

schema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
})

schema.methods.getJWTToken = function () {
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
        expiresIn: "15d",
    }, {
        algorithm: 'HS256'
    });
}

schema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

schema.methods.getResetToken = async function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 1000 * 60 * 15;
    return resetToken;
}

export default mongoose.model("User", schema);