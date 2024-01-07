import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import User from "../models/User.js";

export const changeRole = catchAsyncError(async(req,res,next) => {
    const user = await User.findById(req.user._id);

    if(user.role === "user" && user.isVerifiedInstructor == true){
        user.role = "instructor"
    }
    else{
        user.role = "user"
    }

    await user.save();
    res.redirect(`${process.env.FRONTEND_URL}/api/v1/instructor`)
});
