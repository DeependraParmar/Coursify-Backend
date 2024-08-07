// Sending token with appropriate cookie configuration
export const sendToken = (res, user, message, statusCode = 200) => {
    const token = user.getJWTToken();
    const options = {
        expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
    };
    res.cookie('connect.sid', token, options);
    res.status(statusCode).json({
        success: true,
        message,
        user,
    });
};
