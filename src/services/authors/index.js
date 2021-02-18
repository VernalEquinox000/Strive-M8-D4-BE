const express = require("express")
const { authenticate } = require("../auth/tools")
const passport = require("passport")

const { authorize , refreshToken } = require("../auth/middleware")

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
/*         const token = await authenticate(author)
        res.send(token) */
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
        res.send(req.user)
        
    } catch (error) {
        console.log(error)
        next(error)
        
    }
})


authorsRouter.put("/me", authorize, async (req, res, next) => {
    try {
        const udpates = Object.keys(req.body)
        udpates.forEach(update => (req.user[update] = req.body[update]))
        await req.user.save()



        res.send(req.author)
        
    } catch (error) {
        console.log(error)
        next(error)
        
    }
})


authorsRouter.delete("/me", authorize, async (req, res, next) => {
    try {
        
        await req.user.deleteOne(res.send("deleted"))
        
    } catch (error) {
        console.log(error)
        next(error)
        
    }
})

///LOGOUT
authorsRouter.post("/logout", async (req, res, next) => {
    try {
        req.user.refreshTokens = req.user.refreshTokens.filter(t => t.token !== req.body.refreshToken)
        res.send()
        
    } catch (error) {
        console.log(error)
        next(error)
    }
})


///LOGOUTALL
authorsRouter.post("/logoutAll", async (req, res, next) => {
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
    try {
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
         
    } catch (error) {
        console.log(error)
        next(error)
    }
})

////////NEW CODE BELOW

authorsRouter.get('/googleLogin',
  passport.authenticate('google', { scope: ['profile', 'email'] }));


authorsRouter.get('/googleRedirect', passport.authenticate('google'), async (req, res, next) => {
    res.send("YEEEEEEAHHHHH")
} )

module.exports= authorsRouter