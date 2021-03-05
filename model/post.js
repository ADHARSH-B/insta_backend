const mongoose = require("mongoose")

const Schema = mongoose.Schema

const postSchema = new Schema({
    body:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    image:{
        type:String,
        default:"NO photo"
    },
    likes:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
    comment:[{
        text:String,
        postedby:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}]
    }],
    createdby:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
  
},{timestamps:true})

module.exports = mongoose.model("Post",postSchema)