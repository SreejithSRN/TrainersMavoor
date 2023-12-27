const express=require ("express")
const router=express.Router()
const userController=require("../controllers/userController")
const cartController=require("../controllers/cartController")
const orderController = require("../controllers/orderController")
const paymentController=require("../controllers/paymentController")
const WalletController=require("../controllers/walletController")
const wishlistController=require("../controllers/wishlistController")
const { verifyUser, userExist } = require("../middleware/session.js");


//base root//
router.route("/")
.get(userExist,userController.initial)

// 
router.route("/dashboard")
.get(verifyUser,userController.getDashboard)

//login root//
router.route("/login")
.get(userExist,userController.login)
.post(userExist,userController.signin)

//signup root//
router.route("/signup")
.get(userExist,userController.signup)
.post(userExist,userController.signupPost)

//forgot password root//
router.route("/forgotPwd")
.get(userExist,userController.forgotPwd)
.post(userExist,userController.forgotPWDPost)

//
router.route("/otpverify")
.get(userExist,userController.otpGet)
.post(userExist,userController.otpPostVer)

//
router.route("/passwordrecovery")
.get(userExist,userController.getPasswordRecovery)
.post(userExist,userController.passwordRecoveryPost)

//
router.route("/otpSignup")
.get(userExist,userController.getotpSignup)
.post(userExist,userController.postotpSignup)

//
router.route("/userProductDetails/:id")
.get(verifyUser,userController.getUserProductDetails)

//
router.route("/otpResend")
.get(userExist,userController.otpResend)

//
router.route("/otpResendSignup")
.get(userExist,userController.otpResendSignup)


//
router.route("/userAddress")
.get(verifyUser,userController.getUserAddress)
.post(verifyUser,userController.postAddAddress)

//
router.route("/userPasswordChange")
.get(userController.getpasswordChange)
.post(userController.postPasswordChange)


//
router.route("/addAddress")
.get(verifyUser,userController.addAddress)

//
router.route("/editAddress/:id")
.get(verifyUser,userController.editAddress)
.post(verifyUser,userController.postEditAddress)

//
router.route("/deleteAddress/:id")
.get(verifyUser,userController.deleteAddress)

//
router.route("/addCart/:id")
.get(verifyUser,cartController.addCart)

//
router.route("/getCart")
.get(verifyUser,cartController.getCart)

//
router.route("/updateQuantity")
.post(verifyUser,cartController.updateQuantity)

//
router.route("/removeCartItems/:id")
.get(verifyUser,cartController.removeCartItems)

//
router.route("/checkOut")
.get(verifyUser,cartController.getCheckOut)
.post(verifyUser,paymentController.postCheckOut)

//
router.route("/orderList")
.get(verifyUser,orderController.getUserOrderList)

//
router.route("/cancelOrder/:id")
.get(verifyUser,orderController.cancelOrder)

//
router.route("/userDetailViewOrder/:id")
.get(verifyUser,orderController.getUserDetailViewOrder)

//

router.route("/makePayment")
.get(verifyUser,paymentController.createOrder)
//
router.route("/verifyPayment")
.post(verifyUser,paymentController.verifyPayment)
//
router.route("/onlineCheckOut")
.post(verifyUser,paymentController.onlineCheckOut)

//
router.route("/returnOrder/:id")
.get(verifyUser,orderController.getReturnOrder)
.post(verifyUser,orderController.postReturnOrder)


//route for wallets
router.route("/userWallet")
.get(verifyUser,WalletController.getUserWallet)

//filter routes

router.route("/filters" )
.get(verifyUser,userController.getFilter)
.post(verifyUser,userController.postGetFilter);

//
router.route("/test/:id" )
.get(verifyUser,userController.gettest)

//
router.route("/applycoupon")
.post(verifyUser,userController.postapplycoupon)

//
router.route("/wishlist")
.get (verifyUser,wishlistController.getWishlist)

//
router.route("/wishlist/:id")
.get (verifyUser,wishlistController.addWishlist)

//
router.route("/deleteWishlist/:id")
.get(verifyUser,wishlistController.getdeleteWishlist)

//
router.route("/invoice/:id")
.get (verifyUser,orderController.downloadInvoice)

//
router.route("/profile")
.get(verifyUser,userController.getProfile)




//logout route for user

router.route("/userLogout")
.get(verifyUser,userController.getUserLogout)


module.exports=router
