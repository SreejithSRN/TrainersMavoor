const mongoose=require("mongoose")
const{Schema,objectId}=mongoose
const walletSchema=({
    userId:{type: Schema.Types.ObjectId, ref: "User"},
    
    orders:{type: Schema.Types.ObjectId, ref: "orders" },
    

    totalAmount:{type:Number},

    status:{type:String,default:"Credit"}
    
})
const wallet=mongoose.model('wallet',walletSchema)
module.exports=wallet