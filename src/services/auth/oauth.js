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
    async function ( accessToken, refreshToken, profile, done) {
      console.log(profile)
      try {
        const author = await AuthorModel.findOne({ googleId: profile.id })
        console.log(profile)

        //recap: Google User Yes? then store tokens, then
        //otherwise save it in db and generate tokens


        if (!author) {
            const newAuthor = new AuthorModel({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
              img: profile.picture,
              firstName: profile.name.familyName,
              lastName:profile.name.givenName,
              role: "author",
            refreshTokens: []
            }) 
          
          const savedAuthor = await newAuthor.save()
          console.log(savedAuthor)
          const tokens = await authenticate(savedAuthor)
          console.log(tokens)
          done(null, {author: savedAuthor, tokens}) //not a normale next ---we canuse also done
        } else {

          const tokens = await authenticate(author)
          console.log(tokens)
          done(null, {author, tokens})
        }


        
      } catch (error) {
        console.log(error)
        next(error)
        
      }
  
  }))
    
passport.serializeUser(function (author, done) {
    done(null, author)
  }) 
  //from docs