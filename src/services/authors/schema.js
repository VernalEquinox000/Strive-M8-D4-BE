
const { Schema, model } = require("mongoose")
const bcrypt = require("bcryptjs")


/* name: {
        type: String,
        required:true,
        },
    img: {
        type: String,
        required:true,
        } */
const AuthorSchema = new Schema(

    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
            unique: true,
            minlength: 6
        },
        email: {
            type: String,
            required: true,
        },
        img: {
            type: String,
        },
        firstName: {
            type: String,
        },
        lastName: {
            type: String,
        },
        role: {
            type: String,
            enum: ["author", "admin"]
        },
         refreshTokens: [
      {
        token: {
          type: String,
        },
      },
    ],
    },
        {timestamps: true}
)

AuthorSchema.pre("save", async function (next) {
    const author = this // 
    if (author.isModified("password")) {
        author.password = await bcrypt.hash(author.password, 8)
    /*     bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash("B4c0/\/", salt, function(err, hash) {
        // Store hash in your password DB.
    }); */
    }
    next()
})

AuthorSchema.methods.toJSON = function () {
    const author = this
    const authorObj = author.toObject()

    delete authorObj.password
    delete authorObj.__v

    return authorObj
}

AuthorSchema.statics.findByCredentials = async function (name, password) {
    console.log(name,password)
    const author = await this.findOne({ name })
    if (author) {
        const isMatch = await bcrypt.compare(password, author.password)
        if (isMatch) return author
        else return ("password not valid")
    }
    else return ("author not found!")
    }


module.exports = model("Author", AuthorSchema)