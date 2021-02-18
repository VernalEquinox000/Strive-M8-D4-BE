const { Schema, model } = require("mongoose")
const mongoose = require("mongoose")
const mongoosePaginate = require("mongoose-paginate-v2")

const ReviewSchema = new Schema(
    {
        text: {
            type: String,
            required: true,
        },
        user: {
            type: String,
            required: true,
        }
    })

module.exports = model("Review", ReviewSchema)