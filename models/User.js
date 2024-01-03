import mongoose from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

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
    password: {
        type: String,
        required: [true, "Password is required"],
        minLength: [6, "Password must be at least 6 characters long"],
        select: false,
    },
    role: {
        type: String,
        enum: {
            values: ["user", "admin", "instructor"]
        },
        default: "user"
    },
    googleID: {
        type: String,
        unique: true,
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
                ref: "Course"
            },
            thumbnail: {
                type: String,
                required: true
            }
        }
    ],
    about: {
        type: String,
        maxlength: [500, "About cannot be more than 500 characters"]
    },
    social_media_urls: [
        {
            facebook: String,
            twitter: String,
            github: String,
            linkedin: String,
            website: String,
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
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
        expiresIn: "15d"
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