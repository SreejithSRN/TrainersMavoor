const category = require("../models/categorySchema")
const product = require("../models/productSchema")
const flash = require("express-flash")

module.exports = {
    getAddCategory: (req, res) => {
        res.render("./admin/addcategory")
    },
    addCategory: async (req, res) => {
        try {
            const name = req.body.name;
            const brands = await category.findOne({ name: name })
            if (brands) {
                console.log("category already in the db")
                req.flash("error", "Category already exists")
                res.redirect("/addCategory")

            } else {
                await category.create(req.body)
                req.flash("success", "Category added successfully.......")
                res.redirect("/category")
            }
        } catch (error) {
            console.log(error)
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },
    getCategory: async (req, res) => {
        const page = parseInt(req.query.page) || 1; // Get the page number from query parameters
        const perPage = 5; // Number of items per page
        const skip = (page - 1) * perPage;
        const cat = await category.find({}).sort({ name: 1 }).skip(skip).limit(perPage);
        const totalCount = await category.countDocuments();
        res.render("./admin/category", {
            cat,
            currentPage: page,
            perPage,
            totalCount,
            totalPages: Math.ceil(totalCount / perPage),
        });
    },
    deleteCategory: async (req, res) => {
        const { id } = req.params
        const user = await product.findOne({ category: id })
        if (user) {
            req.flash("error", "Category in use, cannot delete.......")
            res.redirect("/category")
        } else {
            const delCategory = await category.findOneAndDelete({ _id: id })
            res.redirect("/category")
        }

    },
    editCategory: async (req, res) => {
        const { id } = req.params
        const editCategory = await category.findById({ _id: id })
        res.render("./admin/editcategory", { editCategory })

    },
    editedCategory: async (req, res) => {
        const { id } = req.params
        const { name } = req.body
        const categorys = await category.findOne({ name: name })
        if (categorys) {
            req.flash("error", "Category already Exists......")
            res.redirect("/category")
        } else {
            const catUpdate = await category.findByIdAndUpdate({ _id: id }, { name: name })
            req.flash("success", "Category Edited Succesfully...")
            res.redirect("/category")
        }

    }


}