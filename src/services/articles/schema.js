const { Schema, model } = require("mongoose")
const mongoose = require("mongoose")
const mongoosePaginate = require("mongoose-paginate-v2")

/* {
             "_id": "string", // server generated
             "headLine": "string",
             "subHead": "string",
             "content": "string",
             "category": "string",
             "author": {
                 "name": "string",
                 "img": "string"
             },
             "cover": "string",
             "createdAt": Date, // server generated
             "updatedAt": Date // server generated
         } */

         /* A review will look like:
     
         {
             "text": "string",
             "user": "string"
         } */

const ArticleSchema = new Schema(
    {
        headLine: {
            type: String,
            required: true,
        },
        subHead: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        author: {
             type:Schema.Types.ObjectId,ref:"Author"
        },
        cover: {
            type: String,
            required: true,
        },
        reviews: [{
            text: String,
            user: String,
            date: Date,   
        }],

        
    },
    {timestamps: true}
)

module.exports = model("Article", ArticleSchema)