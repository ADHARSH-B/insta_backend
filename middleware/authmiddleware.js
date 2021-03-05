const User = require("../model/user")
const jwt = require("jsonwebtoken")
const { jwt_secret } = require("../key")
module.exports = (req,res,next)=>{
    const { authorization } =req.headers
    console.log(authorization)
    console.log(req.headers)
    if(!authorization){
        return res.status(401).json({"error":"UNAuthorised Please sign in.."})
    }
    console.log(authorization)
   const token = authorization.split(" ")[1]
   jwt.verify(token,jwt_secret,(error,data)=>{
      if(error){
          console.log(error)
        return res.status(401).json({"error":"invalid email or password"})
      }
      const { _id } = data 
      User.findOne({_id:_id})
      .then(userdata=>{
          if(!userdata){
            return res.status(404).json({"error":"No user found"})
          }
          req.user = userdata
          console.log(req.user)
          if(req.user){
            next()
          }
      }).catch(err=>{
        console.log(err)
        return res.status(500).json({"error":"Server side problem cannot handle"})
      })
  })
 
}