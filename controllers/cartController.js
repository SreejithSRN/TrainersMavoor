const product = require("../models/productSchema")
const brand = require("../models/brandSchema")
const category = require("../models/categorySchema")
const cart = require("../models/cartSchema")
const user = require("../models/userSchema")
const order = require("../models/orderSchema")
const coupon = require("../models/couponSchema")
const flash = require("express-flash")

module.exports = {
    addCart: async (req, res) => {
        try {
            const id = req.params.id;
            const newProduct = await product.findOne({ _id: id })
            const stock = newProduct.stock
            const email = req.session.user
            const newUser = await user.findOne({ email: email })
            const oId = newUser?.id
            const check = await cart.findOne({ userId: oId })
            if (check !== null) {
                var currentCart = check.items.find((item) => {
                    return item.productId.equals(id)
                })
                // console.log(currentCart,"test");
                if (currentCart) {
                    if (currentCart.quantity < stock) {
                        currentCart.quantity += 1
                    } else {
                        res.json({
                        });
                        return; //additional line added
                    }
                }
                else {
                    if (stock > 0) {
                        check.items.push({ productId: id, quantity: 1 })
                    } else {
                        res.json({});
                        return;  //additional line added
                    }
                }
                await check.save();
                res.json({
                    success: true,
                })
                // req.flash("success", "Items added to the cart")
            } else {
                if (stock > 0) {
                    const newCart = new cart({
                        userId: newUser?.id,
                        items: [{ productId: id, quantity: 1 }],
                    });
                    await newCart.save();
                    res.json({
                        success: true,
                    })
                } else {
                    res.json({})
                }
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal Server Error" })  ///additional line added
        }
    },

    // getCart: async (req, res) => {
    //     try {            
    //         const email = req.session.user
    //         const newUser = await user.findOne({ email: email })
    //         const userId = newUser.id
    //         const newCart = await cart.findOne({ userId: userId }).populate("items.productId")
    //         let total=0
    //         let totalQuantity=0
    //         if (newCart){
    //             newCart.items.forEach((item=>{
    //                 total+=item.quantity * (item.productId.price-item.productId.discount)
    //                 totalQuantity+=item.quantity 
    //                 req.session.grantTotal=total
    //                 req.session.totalQuantity=totalQuantity
    //         }))            
    //         res.render("./user/userCart", { newCart,total,totalQuantity })
    //         }else{
    //             res.render("./user/userCart", { newCart,total,totalQuantity })
    //         }
    //     } catch (error) {
    //         console.log(error);
    //     }
    // },

    getCart: async (req, res) => {
        try {
            await coupon.findByIdAndUpdate
            const email = req.session.user
            const newUser = await user.findOne({ email: email })
            const userId = newUser?.id
            const newCart = await cart.findOne({ userId: userId }).populate("items.productId")
            let total = 0
            let totalQuantity = 0
            if (newCart) {
                newCart.items.forEach((item) => {
                    if (item.productId) { // Check if productId is not null

                        if(item.productId.offerprice===0){
                            total += item.quantity * (item.productId.price - item.productId.discount)
                        }else{
                            total += item.quantity * (item.productId.offerprice)
                        }
                        totalQuantity += item.quantity
                        req.session.grantTotal = total
                        req.session.totalQuantity = totalQuantity
                    }
                })
                res.render("./user/usercart", { newCart, total, totalQuantity })
            } else {
                res.render("./user/usercart", { newCart, total, totalQuantity })
            }
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },


    updateQuantity: async (req, res) => {

        try {
            const { productId, quantity, carts } = req.body
            const email = req.session.user
            const newUser = await user.findOne({ email: email })
            const dbproduct = await product.findOne({ _id: productId })
            const dbstock = dbproduct.stock;
            const newCart = await cart.findOne({ _id: carts }).populate("items.productId") 
            if (quantity > dbstock) {
                res.json({})
            } else {
                const productInCart = newCart.items.find((item) => item.productId.equals(productId))
                productInCart.quantity = quantity
                await newCart.save()
                res.json({
                    success: true
                })
            }
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },

    removeCartItems: async (req, res) => {
        try {
            const { id } = req.params
            const email = req.session.user
            const newUser = await user.findOne({ email: email })
            const userId = newUser?._id
            const delItem = await cart.findOneAndUpdate({ userId: userId }, { $pull: { items: { productId: id } } }, { new: true })
            res.redirect("/getCart")
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },

    getCheckOut: async (req, res) => {
        try {
            const email = req.session.user
            const newUser = await user.findOne({ email: email })
            const address = newUser?.address
            const total = req.session.grantTotal
            const quantity = req.session.totalQuantity
            let newcoupon=0
            if (total >= 50000 && total <= 99999) {
                newcoupon = await coupon.find({status:"Active",discount: { $gte: 5, $lte: 9 } })                
            } else if (total >=100000 && total <= 149999) {
                newcoupon = await coupon.find({ status:"Active",discount: { $gte: 10, $lte: 14 } })                
            }
            else if (total >=150000 && total <= 199999) {
                newcoupon = await coupon.find({ status:"Active",discount: { $gte: 15, $lte: 19 } })
            } 

            res.render("./user/checkout", { address, total, quantity, newcoupon }) 
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },
}
