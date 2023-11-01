const express=require("express")
const router=express.Router()
const adminController=require("../controllers/adminController")
const brandController=require("../controllers/brandController")
const categoryController=require("../controllers/categoryController")
const productController=require("../controllers/productController")
const customerController=require("../controllers/customerController")
const multer=require("../middleware/multer")

router.route("/admin")
.get(adminController.admin)
.post(adminController.adminLogin)

router.route("/admindashboard")
.get(adminController.dashboardGet)

//..........................................................Category Route.............................................................

router.route("/Category")
.get(categoryController.getCategory)

router.route("/addCategory")
.get(categoryController.getAddCategory)
.post(categoryController.addCategory)

router.route("/deleteCategory/:id")
.get(categoryController.deleteCategory)

router.route("/editCategory/:id")
.get(categoryController.editCategory)
.post(categoryController.editedCategory)

//............................................................End of Category Route.....................................................................



//..........................................................Brands Route.............................................................

router.route("/brand")
.get(brandController.getBrand)

router.route("/addBrand")
.get(brandController.getAddBrand)
.post(brandController.addBrand)

router.route("/deleteBrand/:id")
.get(brandController.deleteBrand)

router.route("/editBrand/:id")
.get(brandController.editBrand)
.post(brandController.editedBrand)

//............................................................End of Brand Route.....................................................................



//..........................................................Product Route.............................................................

router.route("/product")
.get(productController.getProduct)

router.route("/addProduct")
.get(productController.getAddProduct)
.post(multer.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 },{name:'image4',maxCount:1}]),productController.postProduct)

router.route("/blockProduct/:id")
.get(productController.getBlockProduct)

router.route("/productDetails/:id")
.get(productController.productDetails)

router.route("/editProduct/:id")
.get(productController.editGetProduct)
.post(multer.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 },{name:'image4',maxCount:1}]),productController.postEditProduct)

router.route("/cancelProduct")
.get(productController.cancelProduct)

router.route("/deleteProduct/:id")
.get(productController.deleteProduct)

//............................................................End of Product Route .....................................................................



//..........................................................Customer Route.............................................................


router.route("/customer")
.get(customerController.getCustomer)

router.route("/blockUnblock/:id")
.get(customerController.blockUser)


//............................................................End of Customer Route .....................................................................



router.route("/logout")
.get(adminController.getLogout)

module.exports=router