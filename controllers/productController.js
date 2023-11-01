const product=require("../models/productSchema")
const brand=require("../models/brandSchema")
const category=require("../models/categorySchema")
const moment=require("moment")
const flash=require("express-flash")

module.exports={
    getProduct:async (req,res)=>{
        try {
            const products=await product.find()
            .populate("brand")
            .populate("category")            
            res.render("./admin/products",{products})            
        } catch (error) {
            console.log(error);            
        }        
    },
    getAddProduct:async(req,res)=>{
        try {
            const brands=await brand.find({}).sort({name:1})
            const categorys=await category.find({}).sort({name:1})
            res.render("./admin/addProduct",{brands,categorys})             
        } catch (error) {
            console.log(error)           
        }          
    },

    postProduct:async (req,res)=>{
        try {
            const images=[]
            const newCategory=await category.findOne({name:req.body.category})
            const newBrand=await brand.findOne({name:req.body.brand})
            for (let i = 1; i <= 4; i++) {
                const fieldName = `image${i}`;
                if (req.files[fieldName] && req.files[fieldName][0]) {
                  images.push(req.files[fieldName][0].filename);
                }
              }
            let status   
            let display   
            if (req.body.stock <= 0) {
                 status = "Out of Stock";
                }else {
                 status = "In Stock";
                }
                const newProduct = new product({
                    name: req.body.name,
                    price: req.body.price,
                    discount:req.body.discount,
                    description: req.body.description,
                    brand:newBrand._id,
                    tags: req.body.tags,
                    stock: req.body.stock,
                    category: newCategory._id,
                    status: status,
                    display: "Active",
                    updatedOn: moment(new Date()).format("llll"),
                    images: images,
                  });                    
                await newProduct.save()
            req.flash("success", "Product is Added Successfully");
            res.redirect("/addProduct");             
        } catch (error) {
            console.log(error);            
        }       
    },
    getBlockProduct:async(req,res)=>{
        try {
            const {id}=req.params
        const selectedProduct=await product.findOne({_id:id})
        if(selectedProduct.display==="Active"){
            const updateProduct=await product.findByIdAndUpdate({_id:id},{display:"Blocked"})
        }else if(selectedProduct.display==="Blocked"){
            const updateProduct=await product.findByIdAndUpdate({_id:id},{display:"Active"})
        }
        res.redirect("/product")            
        } catch (error) {
            console.log(error)            
        }        
    },
    productDetails:async(req,res)=>{
        try {
            const {id}=req.params
            const productToDisplay=await product.findOne({_id:id}).populate('brand category')
            // console.log(productToDisplay);
            res.render("./admin/productDetails",{productToDisplay})            
        } catch (error) {
            console.log(error)            
        }
    },
    editGetProduct:async(req,res)=>{
        try {
            const{id}=req.params
            const brands=await brand.find()
            const categorys=await category.find()
            const editProduct=await product.findOne({_id:id}).populate('brand category')
            res.render("./admin/editProduct",{editProduct,brands,categorys})            
        } catch (error) {
            console.log(error);
            
        }
    },
    cancelProduct:(req,res)=>{
        try {
            res.redirect("/product")
            
        } catch (error) {
            console.log(error);
            
        }
    },
    postEditProduct:async(req,res)=>{
        try {
            const {id}=req.params          
            let images=[]
            for (let i = 0; i <= 3; i++) {
                const fieldName = `image${i+1}`;
                if (req.files[fieldName] && req.files[fieldName][0]) {
                    images[i] = req.files[fieldName][0].filename;
                    const upload=await product.findByIdAndUpdate({_id:id},{ $set: { [`images.${i}`]: images[i] } })
                }
            }            
            let status
            let display
            if (req.body.stock>0){
                status="In Stock"
            }else{
                status="Out Of Stock"
            }
            const brands=await brand.findOne({name:req.body.brand})
            const categorys=await category.findOne({name:req.body.category})
            const editProduct=await product.findOne({_id:id})
            req.body.brand= brands._id;
            req.body.category=categorys._id           
            const result=await product.findByIdAndUpdate({_id:id},req.body)
            const stocks=await product.findByIdAndUpdate({_id:id},{ $set: { status: status } })
            res.redirect("/product") 
        } catch (error) {
            console.log(error);
        }
    },
    deleteProduct:async(req,res)=>{
        try {
            const{id}=req.params
            const delProduct=await product.findOneAndDelete({_id:id})
            req.flash("error","Are you want to delete the product")
            res.redirect("/product")
            
        } catch (error) {
            console.log(error);
            
        }
    }
}



