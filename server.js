import app from "./app.js";
import {connectDatabase} from "./config/database.js";
import cloudinary from "cloudinary";
import Razorpay from "razorpay";
import nodeCron from "node-cron";
import { InstructorStats } from "./models/InstructorStats.js";

// connecting to the database 
connectDatabase();

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const instance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET,
})

app.get("/", (req,res) => {
    res.send("<h1>Coursify</h1><br> <a href='/api/v1/auth/google'>Login with Google</a> <br><a href='/api/v1/auth/linkedin'>Login with LinkedIn</a> <br> <a href='/api/v1/auth/facebook'>Login with Facebook</a> <br> <a href='/api/v1/auth/github'>Login with Github</a>");
});


nodeCron.schedule("0 0 0 1 * *", async() => {
    try{
        await InstructorStats.create();
    }
    catch(error){
        console.log(error);
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server is live at http://localhost:${process.env.PORT}`);
});