import app from "./app.js";
import {connectDatabase} from "./config/database.js";
import cloudinary from "cloudinary";

// connecting to the database 
connectDatabase();

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.get("/", (req,res) => {
    res.send("<h1>Coursify</h1><br> <a href='/api/v1/auth/google'>Login with Google</a> <br><a href='/api/v1/auth/linkedin'>Login with LinkedIn</a> <br> <a href='/api/v1/auth/facebook'>Login with Facebook</a> <br> <a href='/api/v1/auth/github'>Login with Github</a>");
});


app.listen(process.env.PORT, () => {
    console.log(`Server is live at http://localhost:${process.env.PORT}`);
});