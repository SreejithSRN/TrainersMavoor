const express=require("express")
const router=express.Router()
const adminController=require("../controllers/adminController")
const brandController=require("../controllers/brandController")
const categoryController=require("../controllers/categoryController")
const productController=require("../controllers/productController")
const customerController=require("../controllers/customerController")

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
.get(adminController.getProduct)

router.route("/addProduct")
.get(productController.getProduct)



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