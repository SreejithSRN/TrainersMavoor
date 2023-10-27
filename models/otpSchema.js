const mongoose=require("mongoose")


const otpSchema= new mongoose.Schema({

    email:{
        type:String,
        unique:true
    },
    otp:{
        type:Number
    },
    createdAt:{
        type:Date
    },
    expiresAt:{
        type:Date
    }
})

const OTP=mongoose.model("OTP",otpSchema)

module.exports=OTP