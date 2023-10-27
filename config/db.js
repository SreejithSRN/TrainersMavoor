const mongoose=require("mongoose")
require("dotenv").config()

mongoose.connect(process.env.mongourl).then(()=>{
    console.log("Database Connected Succesfully")
}).catch((err)=>{
    console.log(err);
})
