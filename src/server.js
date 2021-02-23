const express = require("express")
const cors = require("cors")
//const { join } = require("join")
const listEndPoints = require("express-list-endpoints")
const mongoose = require("mongoose")
const passport = require("passport")
const cookieParser = require("cookie-parser")

const articlesRouter = require("./services/articles")
const authorsRouter = require("./services/authors")
//import oauth as trick
const oauth = require("./services/auth/oauth")

const {
  notFoundHandler,
  badRequestHandler,
  genericErrorHandler,
} = require("./errorHandlers")

const server = express()

//adding cors options: 
const whitelist = ["http://localhost:3000"]
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) === -1 || !origin) {
      callback(null,true)
    } else {
      callback(new Error("not allowed from CORS"))

    }
  },
  credentials: true
}



server.use(cors(corsOptions))
const port = process.env.PORT || 5000



//const staticFolderPath = join(__dirname, "../public")
//server.use(express.static(staticFolderPath))
server.use(express.json())
//new for cookies
server.use(cookieParser())
//initialize passport: 
server.use(passport.initialize())



server.use("/articles", articlesRouter)
server.use("/authors", authorsRouter)

// ERROR HANDLERS MIDDLEWARES
server.use(badRequestHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)

console.log(listEndPoints(server))

mongoose.set("debug", true)

mongoose.connect(process.env.MONGO_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
})
    .then(server.listen(port, () => {
    console.log("running on port", port)
    }))
.catch(error => console.log(error))