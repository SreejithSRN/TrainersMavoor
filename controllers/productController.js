const product=require("../models/productSchema")
const flash=require("express-flash")

module.exports={
    getProduct:(req,res)=>{
        res.render("./admin/addProduct")
    }
}
