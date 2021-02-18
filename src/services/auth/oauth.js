const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy

passport.use('google', new GoogleStrategy(
    {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.BE_URL
  },
    function (accessToken, refreshToken, profile, cb) {
      console.log(profile)
  
    }))