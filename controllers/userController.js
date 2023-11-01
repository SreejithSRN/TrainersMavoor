const bcrypt=require("bcrypt")
const User=require("../models/userSchema")
const brand=require("../models/brandSchema")
const category=require("../models/categorySchema")
const product=require("../models/productSchema")
const flash=require("express-session")
const otpFunction=require("../utility/otpVerification")
const OTP=require("../models/otpSchema")

module.exports={
    //................................................Base Root ..................................................................
    initial:(req,res)=>{
        try{
            res.render("./user/index")
        }catch(error){
            console.log(error)
        }
    },
    //................................................Login Page Root..............................................................
    login:(req,res)=>{
        try{
            res.render('./user/login')
        }catch(error){
            console.log(error)
        }
    },
    //...............................................Sign In Page credentials check......................................................

    signin:async(req,res)=>{
        try{
            const {email, password}=req.body
            let newuser=await User.findOne({email})
            if(newuser!==null){
            if(newuser.status==="Active"){
                if(newuser){
                    const passwordMatch = await bcrypt.compare(password,newuser.password)
                        if(passwordMatch){
                            const displayProduct=await product.find({display:"Active"})                           
                            res.render('./user/dashboard',{displayProduct})
                        }else{
                            console.log("Invalid Credentials")
                            req.flash("error","Invalid Credentials")
                            res.redirect("/login")
                        }
                }else{
                    req.flash("error","Invalid Credentials")
                    res.redirect("/login")
                }
            }else{
                req.flash("error","User is blocked by Admin")
                res.redirect("/login")
            }
        }else{
            req.flash("error","User not exist, please Signup")
                res.redirect("/login")
        }            
        }catch(error){
            console.log(error)
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

    forgotPwd:(req,res)=> {
        try{
            res.render('./user/forgotPwd')
        }catch(error){
            console.log(error)
        }
    }, 
    forgotPWDPost:async(req,res)=>{
        try {
            const email=req.body.email
            const users=await User.findOne({email:email})            
            if(users){ 
            otpToBeSent=otpFunction.generateotp();
            const result=otpFunction.sendOTP(req,res,email,otpToBeSent)           
            req.session.user=users
            res.render("./user/otpverify")                
            }
            else{
                req.flash("error", "Email not registered with us")
                res.redirect("/forgotPwd")
            }            
        } catch (error) {
            console.log(error)            
        }
    },
    otpPostVer:async(req,res)=>{
        try {
            const email=req.session.user.email           
            const newUser=await OTP.findOne({email})            
            if(newUser!==null){
                const checkOTP=req.body.otp
            if(Number(checkOTP)===newUser.otp){               
                res.render("./user/passwordrecovery")
            }
            else{
                req.flash("error", "OTP Miss Match, Pls try again")
                res.redirect("/otpverify")
            }
        }else{
            req.flash("error", "OTP Expired")
            res.redirect("/otpverify")
        }            
        } catch (error) {
            console.log(error)            
        }
    },
    otpGet:(req,res)=>{
        res.render("./user/otpverify")
    },
    getPasswordRecovery:(req,res)=>{
        res.render("./user/passwordrecovery")
    },
    passwordRecoveryPost:async(req,res)=>{
        try {
            const email=req.session.user.email 
            const {password,confirmpassword}=req.body
            console.log(password, confirmpassword)
            if(password===confirmpassword){
            const hashpassword=await bcrypt.hash(password,12)
            const updatedUser=await User.findOneAndUpdate({email:email},{$set:{password:hashpassword}}) 
            req.session.destroy()
            res.redirect("/login")
            }
            else{
                req.flash("error", "Password doesnot matched")
                res.redirect("/passwordrecovery")
            }            
        } catch (error) {
            console.log(error)            
        }
    }, 
    //............................................................ End .................................................................
    

    //......................................................... Create New Account .....................................................

    signup:(req,res)=> {
        try{
            if(!req.session.user){
            res.render('./user/signup')
            }
        }catch(error){
            console.log(error)
        }
    },  
    signupPost:async(req,res)=> {
        try{
            const{name,email,password}=req.body
            const user=await User.findOne({email})
            if(user){                
                req.flash("error","email already exists, please try onother one..")
                res.redirect("/signup")
            }
            else{            
            const hashPwd=await bcrypt.hash(password,12)
            const newuser=new User ({name,email,password:hashPwd})
            otpToBeSent=otpFunction.generateotp();
            const result=otpFunction.sendOTP(req,res,email,otpToBeSent)            
            req.session.login=true
            req.session.user=newuser           
            res.redirect("/otpSignup")
            }
        }catch(error){
            console.log(error)
        }
    },
    getotpSignup:(req,res)=>{
        res.render("./user/otpSignup")
    },
    postotpSignup:async(req,res)=>{
        try {           
        const checkOTP=req.body.otp
        const {email,name,password}=req.session.user       
        const testemail=await OTP.findOne({email:email})       
        if(testemail!==null){
            const {otp}=testemail
        if(otp===Number(checkOTP)){
            const newuser={name,email,password}            
            const userData = await User.create(newuser);
            req.session.login=false
            req.session.destroy()               
            res.redirect("/login")
        }else{
            if(req.session.login){
            req.flash("error", "OTP Invalid")
            res.redirect("/otpSignup")
            }
        }
    }else{
        req.flash("error", "OTP Expires, please try resent OTP")
            res.redirect("/otpSignup")
    }
        } catch (error) {
            console.log(error);            
        }
    },
    getUserProductDetails:async(req,res)=>{
        try {
            const{id}=req.params
            const brands=await brand.findOne({_id:id})
            const categorys=await category.findOne({_id:id})
            const displayProduct=await product.findOne({_id:id}).populate('brand category')  
            res.render("./user/userProductDetails",{displayProduct,brand,category})            
        } catch (error) {
            console.log(error);
            
        }
      
    }

};
//....................................................................End...............................................................