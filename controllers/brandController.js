const brand = require("../models/brandSchema")
const product = require("../models/productSchema")
const flash = require("express-flash")
const mongoose = require("mongoose")

module.exports = {
    getAddBrand: (req, res) => {
        res.render("./admin/addbrand")
    },
    addBrand: async (req, res) => {
        try {
            const name = req.body.name;
            const brands = await brand.findOne({ name: name })
            if (brands) {
                console.log("Brand already in the db")
                req.flash("error", "Brand already exists")
                res.redirect("/addBrand")
            } else {
                await brand.create(req.body)
                req.flash("success", "Brand added successfully....")
                res.redirect("/brand")
            }
        } catch (error) {
            console.log(error)
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },
    getBrand: async (req, res) => {

        const page = parseInt(req.query.page) || 1; // Get the page number from query parameters
        const perPage = 5; // Number of items per page
        const skip = (page - 1) * perPage;
        const brands = await brand.find({}).sort({ name: 1 }).skip(skip).limit(perPage);
        const totalCount = await brand.countDocuments();
        res.render("./admin/brand", {
            brands,
            currentPage: page,
            perPage,
            totalCount,
            totalPages: Math.ceil(totalCount / perPage),
        });
    },
    deleteBrand: async (req, res) => {
        const { id } = req.params
        const user = await product.findOne({ brand: id })
        if (user) {
            req.flash("error", "Brand in use, cannot delete.......")
            res.redirect("/brand")
        } else {
            const delBrand = await brand.findOneAndDelete({ _id: id })
            res.redirect("/brand")
        }
    },
    editBrand: async (req, res) => {
        const { id } = req.params
        const editBrand = await brand.findById({ _id: id })
        res.render("./admin/editbrand", { editBrand })
    },
    editedBrand: async (req, res) => {
        const { id } = req.params
        const { name } = req.body
        const brands = await brand.findOne({ name: name })
        if (brands) {
            req.flash("error", "Brand already exists...........")
            res.redirect("/brand")
        } else {
            const brandUpdate = await brand.findByIdAndUpdate({ _id: id }, { name: name })
            req.flash("success", "Brand Edited Successfully.....")
            res.redirect("/brand")
        }

    }
}