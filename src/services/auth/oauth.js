const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const AuthorModel = require("../authors/schema")
const {authenticate} = require("./tools")

passport.use('google', new GoogleStrategy(
    {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.BE_URL
  },
    async function ( accessToken, refreshToken, profile, next) {
      console.log(profile)
      //console.log(refreshToken)

      /* const newAuthor = new AuthorModel({
            googleId: profile.id,
            name: profile.name.familyName,
            surname: profile.name.givenName,
            email: profile.emails[0].value,
            role: "author",
            refreshTokens: []
          }) */

      try {
        const author = await AuthorModel.find({ googleId: profile.id })
        console.log(profile)

        //recap: Google User Yes? then store tokens, then
        //otherwise save it in db and generate tokens

        if (!author) {
            const newAuthor = new AuthorModel({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
              img: profile.picture,
              firstName: profile.givenName,
              lastName:profile.familyName,
              role: "author",
            refreshTokens: []
          }) 
          

          const thisAuthor = await newAuthor.save()
          const tokens = await authenticate(thisAuthor)
          console.log(tokens)
          next(null, { author: thisAuthor, tokens }) //or newAUthor?
          console.log(thisAuthor)
          console.log(tokens)
        } else {

          const tokens = await authenticate(author)
          next(null, {author, tokens}) //next instead of next
          //console.log(tokens)
        }


        
      } catch (error) {
        console.log(error)
        next(error)
        
      }
  
  }))
    
passport.serializeUser(function (author, next) {
    next(null, author)
  }) 
  //from docs