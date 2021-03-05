const express = require("express")
const middleware = require("../middleware/authmiddleware")
const router = express.Router()
const authcontroller = require("../controller/auth")

router.post('/signup',authcontroller.signup)

router.get("/protected",middleware,authcontroller.protected)

router.post('/signin',authcontroller.signin)

router.get("/allpost",middleware,authcontroller.allpost)

router.post("/createpost",middleware,authcontroller.createpost)

router.get("/mypost",middleware,authcontroller.mypost)

router.get("/profile/:userid",middleware,authcontroller.getusersprofile)

router.get("/followingpost",middleware,authcontroller.myfollowingpost)

router.put("/like",middleware,authcontroller.like)

router.put("/unlike",middleware,authcontroller.unlike)

router.put("/makecomment",middleware,authcontroller.makecomment)

router.put("/followuser",middleware,authcontroller.followuser)

router.put("/unfollowuser",middleware,authcontroller.unfollowuser)

router.post("/resetpassword",authcontroller.resetpassword)

router.post("/newpassword",authcontroller.newpassword)

router.put("/searchuser",middleware,authcontroller.searchuser)

router.delete("/deletepost/:postid",middleware,authcontroller.deletepost)

module.exports = router




