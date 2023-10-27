const express=require ("express")
const router=express.Router()
const userController=require("../controllers/userController")

//base root//
router.route("/")
.get(userController.initial)

//login root//
router.route("/login")
.get(userController.login)
.post(userController.signin)

//signup root//
router.route("/signup")
.get(userController.signup)
.post(userController.signupPost)

//forgot password root//
router.route("/forgotPwd")
.get(userController.forgotPwd)
.post(userController.forgotPWDPost)

//
router.route("/otpverify")
.post(userController.otpPostVer)

//
router.route("/passwordrecovery")
.post(userController.passwordRecoveryPost)

//
router.route("/otpSignup")
.get(userController.getotpSignup)
.post(userController.postotpSignup)


module.exports=router
