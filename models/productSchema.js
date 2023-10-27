const mongoose=require("mongoose")

const productSchema=new mongoose.Schema({

    name:{
        type:String
    }

})

const product=mongoose.model("products", productSchema)
module.exports=product