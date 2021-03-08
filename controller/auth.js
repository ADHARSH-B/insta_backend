const User = require("../model/user")
const bcrypt = require("bcryptjs")
const user = require("../model/user")
const jwt = require("jsonwebtoken")
const Post =require("../model/post")
const socket = require('../socket')
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const crypto = require("crypto")
const mongoose = require("mongoose")
const { jwt_secret } = require("../key")
const { request } = require("express")


const transporter = nodemailer.createTransport(
    sendgridTransport({
      auth: {
        api_key:
        "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"
      }
    })
  );

exports.signup = (req,res,next)=>{
    const{email,password,name,pic}=req.body
    if(!email || !password || !name ){
        console.log(email,password,name)
        return res.status(422).json({error:"Please enter all fields..."})
    }
    User.findOne({email:email})
    .then(saveduser=>{
        if(saveduser){
            return res.status(422).json({error:"Email is already present please sign in"})
        }
        bcrypt.hash(password,12).then(hashedpwd=>{
            const user = new User({
                email:email,
                password:hashedpwd,
                name:name,
                pic:pic
            })
            user.save()
            .then(result=>{
                return res.status(200).json({message:"Signup successfully"})
            }).catch(err=>{
                return res.status(500).json({error:"Server side problem cannot handle"})
            })
        }).catch(err=>{
            return res.status(500).json({error:"Server side problem cannot handle"})
        })
        
    }).catch(err=>{
        return res.status(500).json({error:"Server side problem cannot handle"})
    })

}
exports.signin = (req,res,next)=>{
    const{email,password}=req.body
    user.findOne({email:email})
    .then(userdata=>{
       if(!userdata){
           return res.status(422).json({error:"invalid email or password"})
       }
       bcrypt.compare(password,userdata.password)
       .then(domatch=>{
           if(!domatch){
            return res.status(401).json({error:"invalid email or password"})
           }
              const token = jwt.sign({_id:userdata._id},jwt_secret,{expiresIn:"1hr"})
              const { _id,name,followers,following,pic,email} = userdata
              console.log(token)    
              console.log(_id,name)
              return  res.status(200).json({message:"signin succesfull",token:token,user:{_id:_id,name:name,following,followers,pic,email}})
       }).catch(err=>console.log(err))
    }).catch(err=>console.log(err))
}

exports.protected = (req,res,next)=>{
    res.json({message:"hello"})
}

exports.allpost=(req,res,next)=>{
    Post.find().populate("createdby","_id name")
    .populate("comment.postedby","_id name")
    .sort("-createdAt")
    .then(post=>{
        if(!post){
           return res.status(404).json({message:"NO post found"})
        }
        res.status(200).json({allpost:post})
    })
}

exports.mypost = (req,res,next)=>{
    Post.find({createdby:req.user._id}).populate("createdby","_id name")
    .then(post=>{
        if(!post){
            return res.status(404).json({message:"NO post found"})
        }
        return res.status(200).json({post:post})
    })
}

exports.createpost = (req,res,next)=>{
    const { title,body,url} =req.body
    console.log(body,title,url)
    if(!body || !title || !url){
        return res.status(422).json({error:"Enter the form data"})
    }
    req.user.password = undefined
    const post = new Post({
        body:body,
        title:title,
        image:url,
        createdby:req.user,
    })
    post.save().then(post=>{
        res.status(200).json({message:"post created succesfully"})
    })
}

exports.like = (req,res,next)=>{
    Post.findByIdAndUpdate(req.body.postid,{
      $push:{likes:req.user._id}
    },
        {new:true}).populate("createdby","_id name").exec((error,result)=>{
            if(error){
                return res.status(422).json({error:"An error"})
            }
           return  res.json({result})
        })
}
exports.unlike = (req,res,next)=>{
    Post.findByIdAndUpdate(req.body.postid
        ,{$pull:{likes:req.user._id}},
        {new:true})
        .populate("createdby","_id name").exec((error,result)=>{
            if(error){
                return res.status(422).json({error:"An error"})
            }
           return  res.json({result})
        })
}
exports.makecomment = (req,res,next)=>{
    const body ={
        text:req.body.comment,
        postedby:req.user
    }
    Post.findByIdAndUpdate(req.body.postid
        ,{$push:{comment:body}},
        {new:true})
        .populate("comment.postedby","_id name ").exec((error,result)=>{
            if(error){
                return res.status(422).json({error:"An error"})
            }
            console.log(result.comment.postedby)
            console.log(result)
            return result.save().then(result=>
                {
                    console.log(result)
                    return  res.json({result})
                })
           
        
        })
}

exports.deletepost = (req,res,next)=>{
    const id = req.params.postid.replace(":","")
   
    Post.findOne({_id:id}).populate("createdby","_id name")
    .then(post=>{
        console.log("post1",post)
        if(post.createdby._id.toString() === req.user._id.toString()){
            post.remove()
            return res.status(200).json({result:post})
        }
        console.log(post)
        return(res.status(404).json({error:"not able to delete post"}))
    }).catch(err=>{
        console.log(err)
    })
}

exports.getusersprofile = (req,res,next)=>{
   User.findOne({_id:req.params.userid}).select("-password")
   .then(user=>{
       Post.find({createdby:req.params.userid})
       .populate("createdby","_id name")
       .then(posts=>{
          if(!posts){
              return res.json({error:"No post Found!!!"})
          }
          return res.json({user:user,posts:posts})
       })
   })
}

exports.followuser = (req,res,next)=>{
            User.findByIdAndUpdate({_id:req.body.userid}
                    ,{$push:{followers:req.user._id}},
                    {new:true}).then(result=>{
                        console.log(result)
              User.findByIdAndUpdate({_id:req.user._id},
                            {$push:{following:req.body.userid}},
                            {new:true}).select("-password").then(result=>{
                                res.json({message:"followuser successfull",result})
                            }).catch(err=>{
                                console.log(err)
                            })
                    }).catch(errr=>console.log(errr))
            }

exports.unfollowuser = (req,res,next)=>{
    User.findByIdAndUpdate({_id:req.body.userid}
        ,{$pull:{followers:req.user._id}},
        {new:true},(err,result)=>{
            console.log(result)
            User.findByIdAndUpdate({_id:req.user._id},
                {$pull:{following:req.body.userid}},
                {new:true}).select("-password").then(result=>{
                    console.log("result_unfollow2",result)
                    res.json({message:"unfollowuser successfull",result})
                }).catch(err=>{
                    console.log(err)
                })
        })
}

exports.myfollowingpost = (req,res,next)=>{
    console.log(req.user)
    Post.find({createdby:{$in:req.user.following}}).populate("createdby","_id name")
    .sort("-createdAt")
    .populate("comment.postedby","_id name")
    .then(post=>{
        console.log(post)
        if(!post){
           return res.status(404).json({message:"NO post found"})
        }
        res.status(200).json({allpost:post})
    })
}

exports.resetpassword = (req,res,next)=>{
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
          console.log(err);
        }
        const token = buffer.toString('hex');
        User.findOne({ email: req.body.email })
          .then(user => {
            if (!user) {
              return res.json({error:"no user found"})
            }
            user.token = token;
            user.expriresIn = Date.now() + 3600000;
            return user.save();
          })
          .then(result => {
            transporter.sendMail({
              to: req.body.email,
              from: 'chawka@my-markey-shop-of-goods.us',
              subject: 'Password reset',
              html: `
                <p>You requested a password reset</p>
                <p>Click this <a href="https://insta-b32b2.web.app/reset/${token}">link</a> to set a new password.</p>
              `
            });
            return res.json({message:"Check Your Mail"})
          })
          .catch(err => {
            console.log(err);
          });
      });
}

exports.newpassword = (req,res,next) =>{
    const { password,token }= req.body
    console.log("password",password)
    console.log("token",token.token)
    User.findOne({token:token.token})
    .then(user=>{
        console.log(user)
        if(!user){
            return res.json({"error":"no user found"})
        }
        bcrypt.hash(password,12)
        .then(hashedpwd=>{
            user.password = hashedpwd
            user.token = undefined
            user.expiresIn = undefined
            return user.save()
        })
    }).then(result=>{
       return res.json({message:"Password Updated Successfull"})
    })
}
exports.searchuser = (req,res,next)=>{
    let userpattern = new RegExp("^"+req.body.query)
    User.find({email:{$regex:userpattern}}).select("_id name")
    .then(result=>{
        console.log(result)
        res.json({result:result})
    }).catch(err=>console.log(err))
}
// socket.getio().emit("Likes",{action:"unlike",result:[result]})
