const express = require("express")
const mongoose = require("mongoose")
const app =express()


const PORT = process.env.PORT || 8080
const { MONGO_URI } = require('./key')
const authroute = require("./routes/auth")

app.use(express.urlencoded({
    extended:true
}))
app.use(express.json())

app.use((req,res,next)=>{
    res.setHeader("Access-Control-Allow-Origin","*")
    res.setHeader("Access-Control-Allow-Methods","GET,POST,PUT,PATCH,DELETE")
    res.setHeader("Access-Control-Allow-Headers","Content-Type,Authorization")
    next()
})
app.use(authroute)

/*if(process.env.NODE_ENV=="production"){
    app.use(express.static('Instagram-frontend/build'))
    const path=require('path')
    app.get("*",(req,res,next)=>{
        res.sendFile(path.resolve(__dirname,'Instagram-frontend','build','index.html'))
    })
}*/

console.log(process.env.NODE_ENV)
mongoose.connect(MONGO_URI).then(res=>{
    console.log("connected")
    const server  = app.listen(PORT)
    const socket = require("./socket").init(server)
    socket.on("connection",socket=>{
        console.log("client connected")
    })
}).catch(err=>{
    console.log(err)
})




