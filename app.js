import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "dotenv";
import express from "express";
import session from "express-session";
import path from "path";
import ErrorMiddleware from "./middlewares/ErrorMiddleware.js";

// creating the express application here 
const app = express();

// config for dotenv 
config({
    path: "./config/config.env"
});

// setting the template engine to ejs 
app.set("view engine", "ejs");
app.set("views", path.join( process.cwd() , "views"));

app.get("/otp", (req, res) => {
    res.render('otpTemplate', { otp: 123456 });
})
app.get("/reset", (req, res) => {
    res.render('resetPassword', { link: "https://coursify-frontend.vercel.app/" });
});
app.get("/ejs-receipt", (req,res) => {
    res.render('receipt');
})
app.get("/welcome", (req, res) => {
    res.render('welcome', { user: "Deependra Parmar"});
})
app.get("/password", (req, res) => {
    res.render('passwordChanged', { user: "Deependra Parmar", time: "12:00 PM", date: "12th May 2021"});
})


// using the express session middleware here 
app.use(session({
    secret: process.env.SESSION_SECRET,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 15,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
    }
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: [process.env.PRIMARY_FRONTEND_URL, process.env.FRONTEND_URL],
    credentials: true
}));



// importing the routers here 
import courseRouter from "./routes/courseRoutes.js";
import otherRouter from "./routes/otherRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";
import reviewRouter from "./routes/reviewRoutes.js";
import userRouter from "./routes/userRoutes.js";

app.use("/api/v1",userRouter);
app.use("/api/v1",courseRouter);
app.use("/api/v1", otherRouter);
app.use("/api/v1", reviewRouter);
app.use("/api/v1", paymentRouter);

app.get("/api/v1/getkey", (req,res) => {
    res.status(200).json({
        key: process.env.RAZORPAY_API_KEY
    })
})

export default app;

// Using the Custom Error Middleware at the last of the file after exporting the application itself
// Global Catches
app.use(ErrorMiddleware);