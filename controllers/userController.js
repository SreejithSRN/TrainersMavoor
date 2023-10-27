const bcrypt=require("bcrypt")
const User=require("../models/userSchema")
const flash=require("express-session")
const otpFunction=require("../utility/otpVerification")
const OTP=require("../models/otpSchema")


module.exports={
    initial:(req,res)=>{
        try{
            res.render("./user/index")
        }catch(error){
            console.log(error)
        }
    },
    login:(req,res)=>{
        try{
            res.render('./user/login')
        }catch(error){
            console.log(error)
        }
    },
    signin:async(req,res)=>{
        try{
            const {email, password}=req.body
            let newuser=await User.findOne({email})
            if(newuser.status==="Active"){
                if(newuser){
                    const passwordMatch = await bcrypt.compare(password,newuser.password)
                        if(passwordMatch){
                            res.render('./user/dashboard')
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
          
           
        }catch(error){
            console.log(error)
        }
    },
    signup:(req,res)=> {
        try{
            if(!req.session.user){
            res.render('./user/signup')
            }
        }catch(error){
            console.log(error)
        }
    },
    forgotPwd:(req,res)=> {
        try{
            res.render('./user/forgotPwd')
        }catch(error){
            console.log(error)
        }
    }, 
    forgotPWDPost:(req,res)=>{
        try {
            res.render("./user/otpverify")
            
        } catch (error) {
            console.log(error)
            
        }
    },
    otpPostVer:(req,res)=>{
        try {
            res.render("./user/passwordrecovery")
            
        } catch (error) {
            console.log(error)
            
        }
    },
    passwordRecoveryPost:(req,res)=>{
        try {
            res.redirect("/login")
            
        } catch (error) {
            console.log(error)            
        }
    },    
    signupPost:async(req,res)=> {
        try{
            const{name,email,password}=req.body
            const user=await User.findOne({email})
            if(user){
                console.log("user exist")
                req.flash("error","email already exists, please try onother one..")
                res.redirect("/signup")
            }
            else{            
            const hashPwd=await bcrypt.hash(password,12)
            const newuser=new User ({name,email,password:hashPwd})
            otpToBeSent=otpFunction.generateotp();
            const result=otpFunction.sendOTP(req,res,email,otpToBeSent)
            // console.log(newuser);
            req.session.login=true
            req.session.user=newuser
           // newuser.save()
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
        const {otp}=testemail
        // console.log(checkOTP)
        // console.log(otp);
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
        } catch (error) {
            console.log(error);            
        }
    }
};