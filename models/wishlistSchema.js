const mongoose=require("mongoose")
const{Schema,objectId}=mongoose
const wishlistSchema=({
    userId:{
        type: Schema.Types.ObjectId, 
        ref: "User",
        required:true
    },    
    products:[{
        type: Schema.Types.ObjectId, 
        ref: "products" 
    }], 
})

const wishlist= mongoose.model('wishlist', wishlistSchema);

module.exports = wishlist;
 