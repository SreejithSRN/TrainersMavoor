const mongoose=require("mongoose")

const userSchema=new mongoose.Schema({
    name: { type: String, required: true,uppercase:true },
    password: { type: String, required: true },
    email: { type: String, required: true,unique:true },
    status: { type: String ,default:"Active"},    
})

const userModel=mongoose.model("User",userSchema)
module.exports=userModel
