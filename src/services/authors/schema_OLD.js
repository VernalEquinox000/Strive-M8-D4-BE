const { Schema, model } = require("mongoose")


const AuthorSchema = new Schema(
    {
    name: {
        type: String,
        required:true,
        },
    img: {
        type: String,
        required:true,
        }
    
    },
{
  timestamps:true
})

const AuthorModel = model("Author", AuthorSchema);

module.exports = AuthorModel;