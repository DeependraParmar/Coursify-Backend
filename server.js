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
    res.status(200).json({
        success: true,
        message: "Status: 200 ✅"
    });
});


nodeCron.schedule("0 0 0 1 * *", async() => {
    try{
        await InstructorStats.create({});
    }
    catch(error){
        console.log(error);
    }
});

// nodeCron.schedule('*/14 * * * *', async() => {
//     try{
//         const {data} = await axios.get(process.env.SERVER_URL);
//         console.log(data.message);
//     }
//     catch(error){
//         console.log(response.error.data.message);
//         console.log(error);
//     }
// });


app.listen(process.env.PORT, () => {
    console.log(`Server is live at http://localhost:${process.env.PORT}`);
});