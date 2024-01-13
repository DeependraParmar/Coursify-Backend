import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import User from "../models/User.js";

export const GoogleStrategyProvider = () => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL, // Adjust callback URL
    },
        (accessToken, refreshToken, profile, done) => {
            const user = User.findOne({ email: profile.emails[0].value });
            if (user) {
                done(null, user);
            }
            else {
                const newUser = User.create({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    photo: profile.photos[0].value,
                });
                done(null, newUser);
            }
        }
    ));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });
}




