const jwt = require('jsonwebtoken')
const { restart } = require('nodemon')
const Author = require("../authors/schema")
console.log("secret", process.env.JWT_SECRET)
console.log("secter", process.env.REFRESH_JWT_SECRET)

const authenticate = async author => {
    try {
        const newAccessToken = await generateJWT({ _id: author._id })
        console.log(newAccessToken)
        
        //after definition 
        const newRefreshToken = await generateRefreshJWT({ _id: author._id })
        console.log(newRefreshToken)
        console.log(author.refreshTokens)
        author.refreshTokens = author.refreshTokens.concat({ token: newRefreshToken })
        await author.save()
        
        return { token: newAccessToken, refreshToken: newRefreshToken }
        
    } catch (error) {
        console.log(error)

        throw new Error(error)
    }
}

const generateJWT = payload =>
    new Promise((res, rej) => 
        jwt.sign(payload, process.env.JWT_SECRET,
        { expiresIn: "15 minutes" }, (error, token) => {
            if (error) rej(error)
            res(token)
    }))
        

const verifyJWT = token => 
    new Promise((res, rej) => {
        jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
            if (error) rej(error)
            res(decoded)
    })
    })

const generateRefreshJWT = payload =>
    new Promise((res, rej) => 
jwt.sign(payload, process.env.REFRESH_JWT_SECRET, { expiresIn: "7 days" },
    (error, token) => {
        if (error) rej(error)
        res(token)
    }))

    const verifyRefreshJWT = token => 
    new Promise((res, rej) => {
        jwt.verify(token, process.env.REFRESH_JWT_SECRET, (error, decoded) => {
            if (error) rej(error)
            res(decoded)
    })
    })

const refreshToken = async oldRefreshToken => {
    const decoded = await verifyRefreshJWT(oldRefreshToken)
    
    const author = await Author.findOne({ _id: decoded._id })
    
    if (!author) {
        throw new Error("where d'you think to go?!")
    
    }

    const currentRefreshToken = author.refreshTokens.find(
        t=>t.token ===oldRefreshToken
    )

    if (!currentRefreshToken) { throw new Error("your token sucks") }


    const newAccessToken = await generateJWT({ _id: author._id })
    const newRefreshToken = await generateRefreshJWT({ _id: author._id })

    const newRefreshTokens = author.refreshTokens
        .filter(t => t.token != oldRefreshToken).concat({ token: newRefreshToken })
    
    author.refreshTokens = [...newRefreshTokens]
    
    await author.save()
    return {token:newAccessToken, refreshToken:newRefreshToken}
    
}
    

    module.exports = {authenticate, generateJWT, verifyJWT, refreshToken}