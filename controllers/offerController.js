const product = require("../models/productSchema")
const brand = require("../models/brandSchema")
const category = require("../models/categorySchema")
const cart = require("../models/cartSchema")
const user = require("../models/userSchema")
const order = require("../models/orderSchema")
const coupon = require("../models/couponSchema")
const offer=require("../models/offerSchema")
const flash = require("express-flash")


module.exports={
    getOffers:async (req,res)=>{
        try {
            const sendoffer=await offer.find({})
            res.render("./admin/categoryoffer", {sendoffer})            
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })            
        }
    },

    getaddOffer:async (req,res)=>{
        try {
            const sendcategory=await category.find({})
            res.render("./admin/addcategoryoffer",{sendcategory})            
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },

    postaddOffer:async(req,res)=>{
        try {
            const name = req.body.name
            const testoffer = await offer.findOne({ categoryName: name })           
            if (testoffer) {                
                req.flash("error", "Offer already exists for this category....")
                res.redirect("/addOffer")
            } else {
                const newoffer = new offer({
                    categoryName : req.body.name,
                    discount: req.body.discount,
                    valid_from: req.body.valid_from,
                    valid_to: req.body.valid_to,
                    status: "Active"
                })
                await newoffer.save() 
                const newcategory=await category.findOne({name:name}) 
                const categoryId=newcategory._id 
                const updateproduct=await product.find({category:categoryId})
                const newdiscount=(req.body.discount)/100
                for(x of updateproduct){
                    const dbofferprice=x.offerprice
                    x.offerprice =(x.price-x.discount) -(x.price-x.discount)*newdiscount
                    const updateoffer=x.offerprice                   
                    const updateofferprice = await product.findByIdAndUpdate(
                        x._id,
                        { $set: { offerprice: updateoffer, offerdiscount: req.body.discount } },
                        { new: true }
                      );                      
                }
                res.redirect("/offers")
            }            
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })  
        }
    },

    blockoffer:async(req,res)=>{
        try {
            const {id}=req.params
            const updateoffer=await offer.findByIdAndUpdate({_id:id})
                if(updateoffer.status==="Active"){
                    const newoffer=await offer.findByIdAndUpdate({_id:id},{status:"Block"})
                    const categorys = await category.findOne({ name: newoffer.categoryName });
                    const updateproduct=await product.find({category:categorys._id}).populate('category')
                    for(x of updateproduct){
                        const updateoffer=await product.findByIdAndUpdate(x._id,{$set:{offerprice:0,offerdiscount:0}})
                    }                   
                }else{                    
                    const newoffer=await offer.findByIdAndUpdate({_id:id},{status:"Active"})
                    const categorys = await category.findOne({ name: newoffer.categoryName });
                    const updateproduct=await product.find({category:categorys._id}).populate('category') 
                    let offerprice=0
                    let offerdiscount=newoffer.discount
                    const dis=(newoffer.discount)/100
                    for(x of updateproduct){
                        offerprice=(x.price-x.discount)-((x.price-x.discount)*dis)
                        const updateoffer=await product.findByIdAndUpdate(x._id,{$set:{offerprice:offerprice,offerdiscount:offerdiscount}})
                    }  
                }
            res.redirect("/offers")
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" }) 
        }
    },

    deleteoffer:async(req,res)=>{
        try {
            const{id}=req.params
            const offers=await offer.findOne({_id:id})
            const cat=offers.categoryName
            const newcategory=await category.findOne({name:cat})
            const catId=newcategory._id
            const editproduct=await product.find({category:catId})
            for(x of editproduct){
                const updatenormalprice = await product.findByIdAndUpdate(
                    x._id,
                    { $set: { offerprice: 0, offerdiscount: 0 } },
                    { new: true }
                  );                
            }
            const deleteoffer=await offer.findByIdAndDelete({_id:id})  
            res.redirect("/offers")          
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" }) 
        }
    }
}