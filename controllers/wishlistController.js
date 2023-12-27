const order = require("../models/orderSchema")
const wallet = require("../models/walletSchema")
const product = require("../models/productSchema")
const wishlist=require("../models/wishlistSchema")


module.exports={
    getWishlist:async (req,res)=>{
        try {
            const displayProduct=await wishlist.findOne({userId:req.session.userId}).populate('products')  
            console.log(displayProduct);   
            res.render("./user/wishlist",{displayProduct})            
        } catch (error) {
            res.status(500).render("error500", { message: "Internal Server Error" })            
        }        
},

addWishlist: async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.userId;
        const data = await wishlist.findOne({ userId: userId });
        if (data === null) {
            const newwishlist = await wishlist.create({
                userId: userId,
                products: [id]  
            });
        } else if (data.products.includes(id)) {
            req.flash("error", "Product already in the wishlist");
            return res.redirect("/dashboard");
        } else {
            data.products.push(id);
            await data.save();
        }
        res.redirect("/dashboard");
    } catch (error) {       
        console.error(error);
        res.status(500).render("error500", { message: "Internal Server Error" })
    }
},
getdeleteWishlist:async (req,res)=>{
    try {
        const{id}=req.params
        const result=await wishlist.findOneAndUpdate(
            {userId:req.session.userId},
            {$pull:{products:id}},
            {new:true}           
            )
            res.redirect("/wishlist")        
    } catch (error) {
        console.error(error);
        res.status(500).render("error500", { message: "Internal Server Error" })        
    }
}
}
