const mongoose = require("mongoose")

const Schema = mongoose.Schema

const userSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    followers:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
    following:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
    pic:{
        type:String,
        default:"https://res.cloudinary.com/adclouds/image/upload/v1600243267/nouser_w0eqfp.png"
    },
    token:{type:String},
    expriresIn:{type:Date}
})

module.exports = mongoose.model("User",userSchema)