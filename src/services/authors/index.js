const express = require("express")
const passport = require("passport")

const { authorize } = require("../auth/middleware")
const {authenticate,refreshToken} = require("../auth/tools")

const AuthorsModel = require("./schema")

const authorsRouter = express.Router()

authorsRouter.post("/signup", async (req, res, next) => {
    try {
        const newAuthor = new AuthorsModel(req.body)
        const { _id } = await newAuthor.save()
        
        res.status(201).send(_id)
        
    } catch (error) {
        console.log(error)
        next(error)
    }
})

authorsRouter.post("/login", async (req, res, next) => {
    try {
        const {name, password} = req.body
        const author = await AuthorsModel.findByCredentials(name, password)
        console.log("author", author)
        const tokens = await authenticate(author)
        res.send(tokens)
        
        //res.status(201).send(_id)
        
    } catch (error) {
        console.log(error)
        next(error)
    }
})

authorsRouter.get("/", authorize, async (req, res, next) => {
    try {
        console.log(req.author) 
        const authors = await AuthorsModel.find()
        res.send(authors)
        
    } catch (error) {
        console.log(error)
        next(error)
        
    }
})

authorsRouter.get("/me", authorize, async (req, res, next) => {
    try {
        res.send(req.author)
        
    } catch (error) {
        console.log(error)
        next(error)
        
    }
})


authorsRouter.put("/me", authorize, async (req, res, next) => {
    try {
        const udpates = Object.keys(req.body)
        udpates.forEach(update => (req.author[update] = req.body[update]))
        await req.author.save()



        res.send(req.author)
        
    } catch (error) {
        console.log(error)
        next(error)
        
    }
})


authorsRouter.delete("/me", authorize, async (req, res, next) => {
    try {
        
        await req.author.deleteOne(res.send("deleted"))
        
    } catch (error) {
        console.log(error)
        next(error)
        
    }
})

///LOGOUT
authorsRouter.post("/logout", authorize, async (req, res, next) => {
    try {
        req.author.refreshTokens = req.author.refreshTokens.filter(t => t.token !== req.body.refreshToken)
        res.send()
        
    } catch (error) {
        console.log(error)
        next(error)
    }
})


///LOGOUTALL
authorsRouter.post("/logoutAll", authorize, async (req, res, next) => {
    try {
        req.author.refreshToken =[]
        await req.author.save()
        res.send()
        
    } catch (error) {
        console.log(error)
        next(error)
    }
})



////////refreshtoken
authorsRouter.post("/refreshToken", async (req, res, next) => {
        const oldRefreshToken = req.body.refreshToken
        if (!oldRefreshToken) { 
            const err= new Error("Missing token refresho")
            err.httpStatusCode = 400
            next(err)
        } else {
            try {
                
                const theseNewTokens = await refreshToken(oldRefreshToken
                )
                res.send(theseNewTokens)
            } catch (error) {
                console.log(error)
                const err = new Error
                err.httpStatusCode = 403
                next(err)
                
            }
        }
})

////////NEW CODE BELOW

authorsRouter.get('/googleLogin',
  passport.authenticate('google', { scope: ['profile', 'email'] }));


authorsRouter.get('/googleRedirect', passport.authenticate('google'), async (req, res, next) => {
    //res.send("YEEEEEEAHHHHH")
    console.log(req.user.tokens)
    res.cookie("accessToken", req.user.tokens.token)
    res.cookie("refreshToken", req.user.tokens.refreshToken)
    res.redirect(process.env.FE_URL) //+ "?accessToken=" + req.user.tokens.accessToken)
    //attach the token to URL, this so far before cookies

    try {
        
    } catch (error) {
        
    }
} )

module.exports= authorsRouter