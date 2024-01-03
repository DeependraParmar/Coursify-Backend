import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import User from "../models/User.js";

export const GoogleStrategyProvider = () => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
    }, async function (accessToken, refreshToken, profile, done) {
        const user = await User.find({
            email: profile.emails[0].value
        });

        if (!user) {
            const newUser = await User.create({
                name: profile.displayName,
                email: profile.emails[0].value,
                photo: profile.photos[0].value,
                googleID: profile.id,
            });
            return done(null, newUser);
        }
        else {
            return done(null, user);
        }
    }));


    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser(async (id, done) => {
        const user = await User.findById(id);
        done(null, user);
    })
}