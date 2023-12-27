const product = require("../models/productSchema")
const brand = require("../models/brandSchema")
const category = require("../models/categorySchema")
const cart = require("../models/cartSchema")
const user = require("../models/userSchema")
const order = require("../models/orderSchema")
const wallet = require("../models/walletSchema")
const flash = require("express-flash")
const { generateInvoicePDF } = require("../utility/downloadInvoice");

module.exports = {

    getUserOrderList: async (req, res) => {
        try {
            const userId = req.session.userId
            const orderList = await order.find({ userId: userId }).sort({ orderDate: -1 })
            res.render("./user/userorderlist", { orderList })
        } catch (error) {
            console.log(error)
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },

    getUserDetailViewOrder: async (req, res) => {
        try {
            const { id } = req.params
            const newOrders = await order.findOne({ _id: id }).populate('items.productId')
            // console.log(newOrders);
            // console.log(newOrders.items);
            res.render("./user/userorderlistdetail", { newOrders })
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },

    cancelOrder: async (req, res) => {
        try {
            const { id } = req.params
            const userId=req.session.userId
            const orderToDelete = await order.findById({ _id: id })
            if (orderToDelete.status === "Order Placed" || orderToDelete.status === "Shipped") {
                updateProduct = orderToDelete.items
                for (const products of updateProduct) {
                    const dbProduct = await product.findById(products.productId)
                    if (dbProduct) {
                        dbProduct.stock += products.quantity
                        if (dbProduct.stock > 0) {
                            dbProduct.status = "In Stock"
                        }
                        await dbProduct.save()
                    }
                }
                orderToDelete.status = "Cancelled"
                orderToDelete.returnDate=new Date()
                if(orderToDelete.paymentStatus==="Paid"){
                    orderToDelete.paymentStatus="Refund" 
                }else{
                    orderToDelete.paymentStatus="No payment transaction"      
                }
                          
                await orderToDelete.save()

                let creditamount=orderToDelete.totalAmount                

                if (orderToDelete.paymentMethod==="COD"){
                    creditamount=0

                }

                


                const newWallet = new wallet({
                    userId: userId,
                    orders: id,
                    status: "Credit",
                    totalAmount: creditamount
                })
                await newWallet.save()



                req.flash("success", "Order cancelled successfully")
                res.redirect("/orderList")
            } else {
                req.flash("error", "Something went wrong, try again")
                res.redirect("/orderList")
            }
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },




    //admin order list
    getOrderList: async (req, res) => {
        try {
            const orders = await order.find().sort({ orderDate: -1 })
            // console.log(orders);
            res.render("./admin/orderlist", { orders })
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },

    //admin order detail view 
    viewOrder: async (req, res) => {
        try {
            const { id } = req.params
            const newOrders = await order.findOne({ _id: id }).populate('items.productId')
            // console.log(newOrders);
            // console.log(newOrders.items);         
            res.render("./admin/orderdetailedlist", { newOrders })
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },

    //admin order post for changing the status and wallet credit option

    postViewOrder: async (req, res) => {
        try {
            const { id } = req.params
            console.log(id);
            const userId = req.session.userId
            const value = req.body.status
            const reason = req.body.reason
            if (value === "Shipped") {
                const updateOrderDocument = await order.findByIdAndUpdate(id, {
                    status: "Shipped",
                });
            } else if (value === "Delivered") {
                const updateOrderDocument = await order.findByIdAndUpdate(id, {
                    status: "Delivered",
                    paymentStatus: "Paid"
                });
            } else if (value == "reject") {

                const updateOrderDocument = await order.findByIdAndUpdate(id, {
                    status: "Delivered",
                    adminReason: reason,
                    rejectedDate: new Date(),
                    returnStatus: value
                });
            } else if (value == "accept") {
                const updateOrderDocument = await order.findByIdAndUpdate(id, {
                    status: "Returned",
                    adminReason: reason,
                    approvedDate: new Date(),
                    returnStatus: value,
                    paymentStatus: "Refund"
                });
                const orderToUpdate = await order.findById({ _id: id })
                updateProduct = orderToUpdate.items
                for (const products of updateProduct) {
                    const dbProduct = await product.findById(products.productId)
                    if (dbProduct) {
                        dbProduct.stock += products.quantity
                        if (dbProduct.stock > 0) {
                            dbProduct.status = "In Stock"
                        }
                        await dbProduct.save()
                    }
                }
                const newWallet = new wallet({
                    userId: userId,
                    orders: orderToUpdate._id,
                    status: "Credit",
                    totalAmount: orderToUpdate.totalAmount
                })
                await newWallet.save()
            }
            res.redirect("/adminOrderList")
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },


    //admin side return order get
    getReturnPending: async (req, res) => {
        try {
            res.redirect("")

        } catch (error) {
            console.log(error)
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },

    //user order cancel get

    getReturnOrder: async (req, res) => {
        try {
            const { id } = req.params
            const newOrders = await order.findOne({ _id: id }).populate('items.productId')
            res.render("./user/userreturnpage", { newOrders })
            // const {id}=req.params
            // const updateOrderDocument = await order.findByIdAndUpdate(id, {
            //     status: "Return Pending",                                   
            // }); 
            // console.log(id)
            // res.redirect("/orderList")            
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },
    //user side return post
    postReturnOrder: async (req, res) => {
        try {
            const { id } = req.params
            const reason = req.body.reason
            const currentDate = Date.now()
            const updateOrderDocument = await order.findByIdAndUpdate(id, {
                status: "Return Pending",
                userReason: reason,
                returnDate: currentDate
            });           
            res.redirect("/orderList")

        } catch (error) {
            console.log(error)
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },

    downloadInvoice:async(req,res)=>{
        try {
            const {id}=req.params 
            const orderDetails=await order.findOne({_id:id}).populate("items.productId")
            const userData=await user.findOne({_id:req.session.userId})
            let result = await generateInvoicePDF(orderDetails,userData);
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
            "Content-Disposition",
            "attachment; filename=Invoice.pdf"
    );

    res.status(200).end(result);
            console.log(orderDetails.items[0],"orderssssssssssssssss");
            // console.log(userData,"useerrrrrrrrrrrrrrrr");
            // console.log(req.session,"sessionnnnnnn");
        } catch (error) {
            console.log(error)
            res.status(500).render("error500", { message: "Internal Server Error" })            
        }
    }
}