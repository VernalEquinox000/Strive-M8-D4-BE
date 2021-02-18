const jwt = require("jsonwebtoken")
const AuthorModel = require("../authors/schema")
const { verifyJWT } = require("./tools")

const authorize = async (req, res, next) => {
    try {

        const token = req.header("Authorization").replace("Bearer ", "")

        const decoded = await verifyJWT(token)

        const user = await AuthorModel.findOne({ _id: decoded._id })
        console.log(decoded._id)

        if (!user) {
            throw new Error("Error!")
        }

        req.token = token
        req.user = user
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