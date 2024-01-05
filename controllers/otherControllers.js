import { catchAsyncError } from "../middlewares/catchAsyncError";
import User from "../models/User";

export const changeRole = catchAsyncError(async(req,res,next) => {
    const user = await User.findById(req.user._id);

    if(user.role === "user"){
        user.role = "instructor"
    }
    else{
        user.role = "user"
    }

    await user.save();
    
})