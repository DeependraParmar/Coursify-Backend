import rateLimit from "express-rate-limit";

export const standardRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {success: false, message: "Too many requests, please try again after 15 minutes"},
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
        res.status(429).json({ success: false, message: 'Too many requests, please try again after 15 minutes' });
    }
});

export const strictRateLimit = rateLimit({
    windowMs: 5 * 60 * 1000, // 15 minutes
    max: 5,
    message: {success: false, message: "Too many requests from this IP, please try again after 5 minutes"},
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
        res.status(429).json({ success: false, message: 'Too many requests from this IP, please try again after 5 minutes' });
    }
});