import { config } from "dotenv";
import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import passport from "passport";
import { GoogleStrategyProvider } from "./utils/GoogleStrategyProvider.js";
import ErrorMiddleware from "./middlewares/ErrorMiddleware.js";
import cors from "cors";

// creating the express application here 
const app = express();

config({
    path: "./config/config.env"
});

// using the express session middleware here 
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));


// using the middlewares in order to help passport 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.authenticate("session"));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors({
    origin: "https://coursify-frontend.vercel.app/"
}));
app.use(cookieParser());

// using all the strategies here 
// GoogleStrategyProvider();

// importing the routers here 
import userRouter from "./routes/userRoutes.js";
import courseRouter from "./routes/courseRoutes.js";
import otherRouter from "./routes/otherRoutes.js";
import reviewRouter from "./routes/reviewRoutes.js"

app.use("/api/v1",userRouter);
app.use("/api/v1",courseRouter);
app.use("/api/v1", otherRouter);
app.use("/api/v1", reviewRouter);

export default app;

// Using the Custom Error Middleware at the last of the file after exporting the application itself
// Global Catches
app.use(ErrorMiddleware);