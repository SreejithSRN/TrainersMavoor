const coupon = require("../models/couponSchema")
const user = require("../models/userSchema")
const flash = require("express-flash")


module.exports = {
    getadminCoupon: async (req, res) => {
        try {
            const newCoupons = await coupon.find({})
            res.render("./admin/admincoupons", { newCoupons })
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },

    getAddCoupon: async (req, res) => {
        try {
            res.render("./admin/addcoupon")
        } catch (error) {
            console.log(error)
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },
    postAddCoupon: async (req, res) => {
        try {
            const name = req.body.code
            const testcoupon = await coupon.findOne({ code: name })           
            if (testcoupon) {                
                req.flash("error", "Coupon Already Exists....")
                res.redirect("/addCoupon")
            } else {
                const newCoupon = new coupon({
                    code: req.body.code,
                    discount: req.body.discount,
                    valid_from: req.body.valid_from,
                    valid_to: req.body.valid_to,
                    status: "Active"
                })
                await newCoupon.save()
                res.redirect("/adminCoupon")
            }

        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },

    getblockcoupon: async (req, res) => {
        const { id } = req.params
        const editCoupon = await coupon.findOne({ _id: id })
        if (editCoupon.status === "Active") {
            const newCoupon = await coupon.findByIdAndUpdate({ _id: id }, { status: "Block" })
        } else if (editCoupon.status === "Block") {
            const newCoupon = await coupon.findByIdAndUpdate({ _id: id }, { status: "Active" })
        }
        console.log(editCoupon);
        res.redirect("/adminCoupon")
    },

    getdeletecoupon: async (req, res) => {
        try {
            const { id } = req.params
            const newUser = await user.findOne({ _id: id })
            if (newUser) {
                req.flash("error", "Coupon already in use, cannot delete.......")
                res.redirect("/adminCoupon")
            } else {
                const delcoupon = await coupon.findOneAndDelete({ _id: id })
                res.redirect("/adminCoupon")
            }
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },

    geteditcoupon: async (req, res) => {
        try {
            const { id } = req.params
            const editCoupon = await coupon.findOne({ _id: id })
            res.render("./admin/editcoupon", { editCoupon })
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },

    posteditcoupon: async (req, res) => {
        try {
            const { id } = req.params
            const checkcoupon = await coupon.findOne({ _id: id })
            console.log(checkcoupon);
            if (checkcoupon) {
                req.flash("error", "Coupon Already Exists....")
                res.redirect("/adminCoupon")
            } else {
                const updateCoupon = await coupon.findByIdAndUpdate({ _id: id }, req.body)
                res.redirect("/adminCoupon")
            }
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    }
}