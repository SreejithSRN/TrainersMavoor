const bcrypt = require("bcrypt")
const User = require("../models/userSchema")
const brand = require("../models/brandSchema")
const category = require("../models/categorySchema")
const product = require("../models/productSchema")
const coupon = require("../models/couponSchema")
const wallet = require("../models/walletSchema")
const offer = require("../models/offerSchema")
const flash = require("express-session")
const otpFunction = require("../utility/otpVerification")
const OTP = require("../models/otpSchema")
const { request, json } = require("express")
const { default: mongoose } = require("mongoose")

module.exports = {


    //................................................Base Root ..................................................................
    initial: async(req, res) => {
        try {
            const displayProduct = await product.find({ display: "Active" })
            res.render("./user/index",{displayProduct})
        } catch (error) {
            console.log(error)
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },
    //................................................Login Page Root..............................................................
    login: (req, res) => {
        try {
            res.render('./user/login')
        } catch (error) {
            console.log(error)
        }
    },
    getDashboard: async (req, res) => {
        try {
            const userId = req.session.userId
            const newWallet = await wallet.find({ userId:new mongoose.Types.ObjectId(userId) }).populate('orders')
            let debitAmount = 0, creditAmount = 0, walletTotal = 0
            for (x of newWallet) {
                if (x.status === "Debit") {
                    debitAmount += x.totalAmount
                } else if (x.status === "Credit") {
                    creditAmount += x.totalAmount
                }
            }
            const walletamounts=await User.findOne({_id:userId})
            walletTotal = creditAmount + walletamounts?.referedAmount - debitAmount
            req.session.walletAmount = walletTotal
            console.log(req.session);

            const page = parseInt(req.query.page) || 1; // Get the page number from query parameters
        const perPage = 8; // Number of items per page
        const skip = (page - 1) * perPage;
        const displayProduct = await product.find({ display: "Active" }).sort({ name: 1 }).skip(skip).limit(perPage);
        const totalCount = await product.countDocuments();
        res.render('./user/dashboard', {
            displayProduct,
            currentPage: page,
            perPage,
            totalCount,
            totalPages: Math.ceil(totalCount / perPage),
        });


            
            // const displayProduct = await product.find({ display: "Active" })
            // req.session.logged=true
            // res.render('./user/dashboard', { displayProduct })
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },



    //     try {
    //         const userId = req.session.userId
    //         const newWallet = await wallet.find({ userId:new mongoose.Types.ObjectId(userId) }).populate('orders')
    //         let debitAmount = 0, creditAmount = 0, walletTotal = 0
    //         for (x of newWallet) {
    //             if (x.status === "Debit") {
    //                 debitAmount += x.totalAmount
    //             } else if (x.status === "Credit") {
    //                 creditAmount += x.totalAmount
    //             }
    //         }
    //         const walletamounts=await User.findOne({_id:userId})
    //         walletTotal = creditAmount + walletamounts?.referedAmount - debitAmount
    //         req.session.walletAmount = walletTotal
    //         console.log(req.session);


    //         const displayProduct = await product.find({ display: "Active" })
    //         // req.session.logged=true
    //         res.render('./user/dashboard', { displayProduct })
    //     } catch (error) {
    //         console.log(error);
    //         res.status(500).render("error500", { message: "Internal Server Error" })
    //     }
    // },
    //...............................................Sign In Page credentials check......................................................

    signin: async (req, res) => {
        try {
            const { email, password } = req.body
            let newuser = await User.findOne({ email })
            // console.log(newuser._id)
            if (newuser !== null) {
                if (newuser.status === "Active") {
                    if (newuser) {
                        const passwordMatch = await bcrypt.compare(password, newuser.password)
                        if (passwordMatch) {
                            // const displayProduct=await product.find({display:"Active"}) 
                            req.session.user = newuser.email
                            req.session.userId = newuser._id
                            req.session.logged=true
                            res.redirect("/dashboard")
                            // res.render('./user/dashboard',{displayProduct})
                        } else {
                            console.log("Invalid Credentials")
                            req.flash("error", "Invalid Credentials")
                            res.redirect("/login")
                        }
                    } else {
                        req.flash("error", "Invalid Credentials")
                        res.redirect("/login")
                    }
                } else {
                    req.flash("error", "User is blocked by Admin")
                    res.redirect("/login")
                }
            } else {
                req.flash("error", "User not exist, please Signup")
                res.redirect("/login")
            }
        } catch (error) {
            console.log(error)
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },

    //.................................................................. End ...............................................................


    // signup:(req,res)=> {
    //     try{
    //         if(!req.session.user){
    //         res.render('./user/signup')
    //         }
    //     }catch(error){
    //         console.log(error)
    //     }
    // },


    //................................................ Forgot Password Settings  ...........................................................

    forgotPwd: (req, res) => {
        try {
            res.render('./user/forgotpwd')
        } catch (error) {
            console.log(error)
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },
    forgotPWDPost: async (req, res) => {
        try {
            const email = req.body.email
            const users = await User.findOne({ email: email })
            if (users) {
                otpToBeSent = otpFunction.generateotp();
                const result = otpFunction.sendOTP(req, res, email, otpToBeSent)
                req.session.user = users
                res.render("./user/otpverify")
            }
            else {
                req.flash("error", "Email not registered with us")
                res.redirect("/forgotPwd")
            }
        } catch (error) {
            console.log(error)
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },
    otpPostVer: async (req, res) => {
        try {
            const email = req.session.user.email
            const newUser = await OTP.findOne({ email })
            if (newUser !== null) {
                const checkOTP = req.body.otp
                if (Number(checkOTP) === newUser.otp) {
                    res.render("./user/passwordrecovery")
                }
                else {
                    req.flash("error", "OTP Miss Match, Pls try again")
                    res.redirect("/otpverify")
                }
            } else {
                req.flash("error", "OTP Expired")
                res.redirect("/otpverify")
            }
        } catch (error) {
            console.log(error)
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },
    otpResend: async (req, res) => {
        try {
            const users = await OTP.findOne({ email: req.session.user.email })
            console.log(users);
            if (users == null) {
                email = req.session.user.email
                otpToBeSent = otpFunction.generateotp();
                const result = otpFunction.sendOTP(req, res, email, otpToBeSent)
                req.flash("success", "New OTP send successfully")
                res.redirect("/otpverify")
            } else {
                console.log(users.otp);
                req.flash("error", "OTP already send")
                res.redirect("/otpverify")
            }
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },
    otpGet: (req, res) => {
        res.render("./user/otpverify")
    },
    getPasswordRecovery: (req, res) => {
        res.render("./user/passwordrecovery")
    },
    passwordRecoveryPost: async (req, res) => {
        try {
            const email = req.session.user.email
            const { password, confirmpassword } = req.body
            // console.log(password, confirmpassword)
            if (password === confirmpassword) {
                const hashpassword = await bcrypt.hash(password, 12)
                const updatedUser = await User.findOneAndUpdate({ email: email }, { $set: { password: hashpassword } })
                req.session.destroy()
                res.redirect("/login")
            }
            else {
                req.flash("error", "Password doesnot matched")
                res.redirect("/passwordrecovery")
            }
        } catch (error) {
            console.log(error)
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },
    //............................................................ End .................................................................


    //......................................................... Create New Account .....................................................

    signup: (req, res) => {
        try {
            const referal = req.query.ref
            if (referal != undefined) {
                req.session.referal = referal
            }

            console.log(referal);
            if (!req.session.user) {
                res.render('./user/signup')
            }
        } catch (error) {
            console.log(error)
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },
    signupPost: async (req, res) => {
        try {
            console.log(req.session.referal, "iam in post signup");
            const { name, email, password } = req.body
            const user = await User.findOne({ email })
            if (user) {
                req.flash("error", "email already exists, please try onother one..")
                res.redirect("/signup")
            }
            else {
                const hashPwd = await bcrypt.hash(password, 12)
                const newuser = new User({ name, email, password: hashPwd })
                otpToBeSent = otpFunction.generateotp();
                const result = otpFunction.sendOTP(req, res, email, otpToBeSent)
                req.session.login = true
                req.session.user = newuser
                // req.session.logged=true
                res.redirect("/otpSignup")
            }
        } catch (error) {
            console.log(error)
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },
    getotpSignup: (req, res) => {
        res.render("./user/otpsignup")
    },
    postotpSignup: async (req, res) => {
        try {
            const checkOTP = req.body.otp
            const { email, name, password } = req.session.user
            const testemail = await OTP.findOne({ email: email })
            if (testemail !== null) {
                const { otp } = testemail
                if (otp === Number(checkOTP)) {
                    const newuser = { name, email, password }
                    const userData = await User.create(newuser);
                    const referaluser = await User.findOne({ email: newuser.email })
                    console.log(referaluser);
                    const id = referaluser._id
                    console.log(id);
                    console.log(req.session.referal);
                    const updatereferaluser = await User.findByIdAndUpdate(id, { $set: { referredBy: req.session.referal } })
                    const updateUser = await User.findOne({ _id: req.session.referal })
                    if (updateUser) {
                        const referedAmount = updateUser.referedAmount || 0; // Assuming a default value of 0
                        total = referedAmount + 100;
                      
                        const newupdateUser = await User.findByIdAndUpdate(
                          req.session.referal,
                          { $set: { referedAmount: total } }
                        );
                      
                        const newupdateUser1 = await User.findByIdAndUpdate(
                          req.session.referal,
                          { $push: { referredUsers: id } }
                        );
                    }
                    // total = updateUser.referedAmount + 100
                    // const newupdateUser = await User.findByIdAndUpdate(req.session.referal, { $set: { referedAmount: total } })
                    // const newupdateUser1 = await User.findByIdAndUpdate(req.session.referal, { $push: { referredUsers: id } })
                    // const updatewallet=await wallet.findByIdAndUpdate(req.session.referal,{$set:{totalAmount:total}})
                    req.session.login = false
                    req.session.destroy()
                    res.redirect("/login")
                }else {
                    if (req.session.login) {
                        req.flash("error", "OTP Invalid")
                        res.redirect("/otpSignup")
                    }
                }
            } else {
                req.flash("error", "OTP Expires, please try resent OTP")
                res.redirect("/otpSignup")
            }
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },
    otpResendSignup: async (req, res) => {
        try {
            const users = await OTP.findOne({ email: req.session.user.email })
            if (users == null) {
                email = req.session.user.email
                otpToBeSent = otpFunction.generateotp();
                const result = otpFunction.sendOTP(req, res, email, otpToBeSent)
                req.flash("success", "New OTP send successfully")
                res.redirect("/otpSignup")
            } else {
                console.log(users.otp);
                req.flash("error", "OTP already send")
                res.redirect("/otpSignup")
            }
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },
    getUserProductDetails: async (req, res) => {
        try {
            const { id } = req.params
            const brands = await brand.findOne({ _id: id })
            const categorys = await category.findOne({ _id: id })
            const displayProduct = await product.findOne({ _id: id }).populate('brand category')
            const totalQuantity = req.session.totalQuantity
            res.render("./user/userproductdetails", { displayProduct, brand, category, totalQuantity })
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },
    getpasswordChange: async (req, res) => {
        try {
            const user = req.session.user
            res.render("./user/userpasswordchange")
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },
    postPasswordChange: async (req, res) => {
        try {
            const { password, newpassword, confirmpassword } = req.body
            const newemail = req.session.user
            const newUser = await User.findOne({ email: newemail })
            const passwordMatch = await bcrypt.compare(password, newUser.password)
            if (passwordMatch == false) {
                req.flash("error", "current password doesnot match")
                res.redirect("/userPasswordChange")
            }
            else if (newpassword === confirmpassword && password != newpassword) {
                console.log(password);
                console.log(newpassword);
                const hashPassword = await bcrypt.hash(newpassword, 12)
                const updatedUser = await User.findOneAndUpdate({ email: newUser.email }, { $set: { password: hashPassword } })
                req.flash("success", "Password changed successfully")
                res.redirect("/dashboard")
            } else {
                req.flash("error", "current password and new password are same")
                res.redirect("/userPasswordChange")
            }
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },
    addAddress: async (req, res) => {
        try {
            res.render("./user/useraddaddress")
        } catch (error) {
            console.log(error)
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },
    postAddAddress: async (req, res) => {
        try {
            const name = req.body
            const email = req.session.user
            // console.log(email); 
            const addressData = {
                name: req.body.name,
                addressLane: req.body.houseName,
                city: req.body.city,
                pincode: req.body.pincode,
                state: req.body.state,
                mobile: req.body.mobile,
                altMobile: req.body.altMobile
            };
            const user = await User.findOne({ email: email })
            if (user) {
                user.address.push(addressData);
                await user.save();
                req.flash("success", "Address added successfully")
                res.redirect("/userAddress")
            }
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },
    getUserAddress: async (req, res) => {
        try {
            const email = req.session.user
            const newUser = await User.findOne({ email: email })
            const addresses = newUser.address
            // console.log(newUser.address);
            res.render("./user/useraddress", { addresses })
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },
    editAddress: async (req, res) => {
        try {
            const { id } = req.params
            const email = req.session.user
            const newUser = await User.findOne({ email: email })
            const addresses = newUser.address.id(id)
            res.render("./user/usereditaddress", { addresses })
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },
    postEditAddress: async (req, res) => {
        try {
            const { id } = req.params
            const email = req.session.user
            const newUser = await User.findOne({ email: email })
            const newEditAddress = newUser.address.id(id)

            newEditAddress.name = req.body.name,
                newEditAddress.addressLane = req.body.houseName,
                newEditAddress.city = req.body.city,
                newEditAddress.pincode = req.body.pincode,
                newEditAddress.state = req.body.state,
                newEditAddress.mobile = req.body.mobile,
                newEditAddress.altMobile = req.body.altMobile
            await newUser.save()
            req.flash("success", "Address updated successfully......")
            res.redirect("/userAddress")

        } catch (error) {

            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },
    deleteAddress: async (req, res) => {
        try {
            const { id } = req.params
            const email = req.session.user
            const newUser = await User.findOne({ email: email })
            const userId = newUser._id
            // console.log(id);
            // console.log(userId)
            // console.log(newUser.address.id(id));
            await User.findByIdAndUpdate({ _id: userId }, { $pull: { address: { _id: id } } })

            res.redirect("/userAddress")

        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },
    getUserLogout: (req, res) => {
        try {
            console.log(req.session);
            req.session.logged=false
            req.session.user = ""
            req.session.userId = ""
            console.log("Start",req.session,"Stop");
            res.redirect("/")
            // req.session.destroy()
        } catch (error) {
            console.log(error)
            res.status(500).render("error500", { message: "Internal Server Error" })
        }

    },

    getFilter: async (req, res) => {
        try {
            const displayProduct = await product.find({})
            const newbrand = await brand.find({})
            const newcategory = await category.find({})
            res.render("./user/shop", { displayProduct, newbrand, newcategory })
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" });
        }
    },

    postGetFilter: async(req, res) =>{

        try {
            const displayProduct = await product.find({});
            const newbrand = await brand.find({});
            const newcategory = await category.find({});
    
            let filterCriteria = {}; // Object to store filter criteria
    
            // Check if category is selected
            if (req.body.category) {
                filterCriteria.category = req.body.category;
            }
    
            // Check if brand is selected
            if (req.body.brand) {
                filterCriteria.brand = req.body.brand;
            }
    
            // Apply filters to the product query
            const filteredProducts = await product.find(filterCriteria);
    
            res.render("./user/shop", { displayProduct: filteredProducts, newbrand, newcategory });
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" });
        }

    },
    gettest: async (req, res) => {
        try {
            const { id } = req.params
            const brands = await brand.find({})
            const newcategory = await category.find({})          
            const newbrand= await brand.find({})
            if(newcategory){
                 newproducts = await product.find({ category: id })
                 console.log(newproducts);
                 if(newproducts.length<=0){
                    newproducts = await product.find({ brand: id })
                 }
            }
            
            res.render("./user/shopfilter", { newproducts, newcategory,newbrand })
        } catch (error) {
            console.log(error)
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },

    postapplycoupon: async (req, res) => {
        try {
            const couponname = req.body.coupon;
            if (couponname) {
                const applycoupon = await coupon.findOne({ code: couponname });
                const disval = applycoupon.discount / 100;
                const total = req.session.grantTotal;
                const discountedamount = total * disval;
                const finalamount = total - discountedamount;

                // Reduce discountedamount to two digits after the decimal point
                const roundedDiscountedAmount = Number(discountedamount.toFixed(2));

                req.session.amounttopay = finalamount;
                req.session.couponDiscount = roundedDiscountedAmount;

                res.json({ success: true, discountedAmount: roundedDiscountedAmount, grandTotal: finalamount });
            } else {
                req.session.couponDiscount = 0;
                req.session.amounttopay = req.session.grantTotal;
                res.json({ success: false });
            }
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" });
        }
    },


    getProfile: async (req, res) => {
        try {
            const userId = req.session.userId
            const newuser = await User.findOne({ _id: req.session.userId }).populate('referredUsers referredBy')
            console.log(newuser);
            const newWallet = await wallet.find({ userId: userId }).populate('orders')
            // console.log(newWallet);
            let debitAmount = 0, creditAmount = 0, walletTotal = 0
            for (x of newWallet) {
                if (x.status === "Debit") {
                    debitAmount += x.totalAmount
                } else if (x.status === "Credit") {
                    creditAmount += x.totalAmount
                }
            }
            const walletamounts=await User.findOne({_id:userId})
            walletTotal = creditAmount + walletamounts.referedAmount - debitAmount
            // walletTotal = creditAmount - debitAmount
            req.session.walletAmount = walletTotal
            res.render("./user/profile", { newuser, newWallet, walletTotal, walletamounts })
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" });
        }
    }
}

//....................................................................End....................................................................





// postapplycoupon: async (req, res) => {
//     try {
//         const couponname = req.body.coupon
//         if (couponname) {
//             const applycoupon = await coupon.findOne({ code: couponname })
//             const disval = (applycoupon.discount) / 100
//             const total = req.session.grantTotal
//             const discountedamount = (total * disval)
//             const finalamount = total - (total * disval)
//             req.session.amounttopay = finalamount
//             req.session.couponDiscount=discountedamount
//             // console.log('@@@');
//             // console.log(total, disval);
//             // console.log(discountedamount, finalamount);
//             // console.log(req.session.amounttopay);
//             res.json({ success: true, discountedAmount: discountedamount, grandTotal: finalamount })
//         } else {
//             req.session.couponDiscount=0
//             req.session.amounttopay = req.session.grantTotal
//             res.json({ success: false })
//         }


//     } catch (error) {
//         console.log(error);
//         res.status(500).render("error500", { message: "Internal Server Error" })
//     }
// }