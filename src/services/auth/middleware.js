const jwt = require("jsonwebtoken")
const AuthorModel = require("../authors/schema")
const { verifyJWT } = require("./tools")

const authorize = async (req, res, next) => {
    try {

        const token = req.header("Authorization").replace("Bearer ", "")
        
        const decoded = await verifyJWT(token)

        const author = await AuthorModel.findOne({ _id: decoded._id })
        console.log(decoded._id)

        if (!author) {
            throw new Error("Error!")
        }

        req.token = token
        req.author = author
        next()
    } catch (e) {
        console.log(e)
        const err = new Error("Autenticaaaa!")
        //console.log(err)
        err.httpStatusCode = 401
        next(err)
    }
}

module.exports = {authorize}