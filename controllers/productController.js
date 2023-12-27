const product = require("../models/productSchema")
const brand = require("../models/brandSchema")
const category = require("../models/categorySchema")
const offer=require("../models/offerSchema")
const flash = require("express-flash")
const moment = require("moment")

module.exports = {

    getProduct: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1; // Get the page number from query parameters
            const perPage = 5; // Number of items per page
            const skip = (page - 1) * perPage;
            const products = await product.find().sort({ name: 1 }).skip(skip).limit(perPage)
                .populate("brand")
                .populate("category")
            const totalCount = await product.countDocuments();
            res.render("./admin/products", {
                products,
                currentPage: page,
                perPage,
                totalCount,
                totalPages: Math.ceil(totalCount / perPage)
            })
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },

    getAddProduct: async (req, res) => {
        try {
            const brands = await brand.find({}).sort({ name: 1 })
            const categorys = await category.find({}).sort({ name: 1 })
            res.render("./admin/addproduct", { brands, categorys })
        } catch (error) {
            console.log(error)
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },

    postProduct: async (req, res) => {
        try {
            const images = []
            const newCategory = await category.findOne({ name: req.body.category })
            const newBrand = await brand.findOne({ name: req.body.brand })
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
            } else {
                status = "In Stock";
            }

            console.log(req.body.discount, "iam here");
            console.log(req.body.price, "iam here");
            console.log(req.body.price-req.body.discount);
            if (Number(req.body.discount) >= Number(req.body.price)) {
                req.flash("error1", "Discount price must be less than product price")
                res.redirect("/addProduct");
            } else {
                const checkcatoffer=await offer.findOne({categoryName:req.body.category})                
                let offerprice=0, offerdiscount=0
                if(checkcatoffer && checkcatoffer.status==="Active"){ 
                    const dis=(checkcatoffer.discount)/100
                     offerprice=(req.body.price-req.body.discount)- (req.body.price-req.body.discount)*dis 
                }
                const newProduct = new product({
                    name: req.body.name,
                    price: req.body.price,
                    discount: req.body.discount,
                    description: req.body.description,
                    brand: newBrand._id,
                    tags: req.body.tags,
                    offerprice:offerprice,
                    offerdiscount:offerdiscount,
                    stock: req.body.stock,
                    category: newCategory._id,
                    status: status,
                    display: "Active",
                    updatedOn: moment(new Date()).format("llll"),
                    images: images,
                });
                await  newProduct.save()

                req.flash("success", "Product is Added Successfully");
                res.redirect("/Product");
            }
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },

    getBlockProduct: async (req, res) => {
        try {
            const { id } = req.params
            const selectedProduct = await product.findOne({ _id: id })
            if (selectedProduct.display === "Active") {
                const updateProduct = await product.findByIdAndUpdate({ _id: id }, { display: "Blocked" })
            } else if (selectedProduct.display === "Blocked") {
                const updateProduct = await product.findByIdAndUpdate({ _id: id }, { display: "Active" })
            }
            res.redirect("/product")
        } catch (error) {
            console.log(error)
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },

    productDetails: async (req, res) => {
        try {
            const { id } = req.params
            const productToDisplay = await product.findOne({ _id: id }).populate('brand category')
            // console.log(productToDisplay);
            res.render("./admin/productdetails", { productToDisplay })
        } catch (error) {
            console.log(error)
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },

    editGetProduct: async (req, res) => {
        try {
            const { id } = req.params
            const brands = await brand.find()
            const categorys = await category.find()
            const editProduct = await product.findOne({ _id: id }).populate('brand category')
            res.render("./admin/editproduct", { editProduct, brands, categorys })
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },

    cancelProduct: (req, res) => {
        try {
            res.redirect("/product")

        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },

    postEditProduct: async (req, res) => {
        try {
            const { id } = req.params
            let images = []
            for (let i = 0; i <= 3; i++) {
                const fieldName = `image${i + 1}`;
                if (req.files[fieldName] && req.files[fieldName][0]) {
                    images[i] = req.files[fieldName][0].filename;
                    const upload = await product.findByIdAndUpdate({ _id: id }, { $set: { [`images.${i}`]: images[i] } })
                }
            }
            let status
            let display
            if (req.body.stock > 0) {
                status = "In Stock"
            } else {
                status = "Out Of Stock"
            }
            const editProduct = await product.findOne({ _id: id })
            const brands = await brand.findOne({ name: req.body.brand })
            const categorys = await category.findOne({ name: req.body.category })  
            console.log(categorys,"i love u");          
            if (categorys!= null){
            const checkoffer=await offer.findOne({categoryName:categorys.name})
            if(checkoffer && checkoffer.status==="Active"){
                let offerprice=0                
                const dis=(checkoffer.discount)/100
                offerprice=(req.body.price-req.body.discount)- (req.body.price-req.body.discount)*dis 
                const updateproduct=await product.findByIdAndUpdate({_id:id},{$set:{offerprice:offerprice,offerdiscount:checkoffer.discount}})
                console.log(checkoffer,"hai all");
            } 
            else{
                const updateproduct=await product.findByIdAndUpdate({_id:id},{$set:{offerprice:0,offerdiscount:0}})
            }         
            }

            if (req.body.brand == null) {
                req.body.brand = editProduct.brand
            } else {
                req.body.brand = brands._id;
            }
            if (req.body.category == null) {
                req.body.category = editProduct.category
            } else {
                req.body.category = categorys._id
            }
            const result = await product.findByIdAndUpdate({ _id: id }, req.body)
            const stocks = await product.findByIdAndUpdate({ _id: id }, { $set: { status: status } })
            req.flash("success", "Product is Edited Successfully");
            res.redirect("/product")
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },

    deleteProduct: async (req, res) => {
        try {
            const { id } = req.params
            const delProduct = await product.findOneAndDelete({ _id: id })
            req.flash("error", "Product deleted successfully.....")
            res.redirect("/product")

        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    }

}



