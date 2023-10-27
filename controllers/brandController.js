const brand=require("../models/brandSchema")
const flash=require("express-flash")
const mongoose=require("mongoose")

module.exports={
    
    getAddBrand:(req,res)=>{
        res.render("./admin/addBrand")
    },
    addBrand:async(req,res)=>{
    
        try {
            const name=req.body.name;       
            const brands=await brand.findOne({name:name})       
            if(brands){
                console.log("Brand already in the db")
                req.flash("error","Brand already exists")
                res.redirect("/addBrand")                
            }else{
                await brand.create(req.body)
                res.redirect("/brand")
            }        
        } catch (error) {
            console.log(error)            
        }     
    },
    getBrand:async(req,res)=>{
   
        const page = parseInt(req.query.page) || 1; // Get the page number from query parameters
        const perPage = 5; // Number of items per page
        const skip = (page - 1) * perPage;
        const brands = await brand.find().skip(skip).limit(perPage);
        const totalCount = await brand.countDocuments();
        res.render("./admin/brand", {
        brands,
      
        currentPage: page,
        perPage,
        totalCount,
        totalPages: Math.ceil(totalCount / perPage),
      });       
    },
    deleteBrand:async(req,res)=>{
        const {id}= req.params
        const delBrand=await brand.findOneAndDelete({_id:id})
        res.redirect("/brand")
    },
    editBrand:async(req,res)=>{
        const{id}=req.params
        const editBrand=await brand.findById({_id:id}) 
        res.render("./admin/editBrand",{editBrand})
    },
    editedBrand:async(req,res)=>{
        const {id}=req.params       
        const {name}= req.body       
        const brandUpdate=await brand.findByIdAndUpdate({_id:id},{name:name})        
        res.redirect("/brand")
    }


}