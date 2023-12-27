const Razorpay = require("razorpay");
const product = require("../models/productSchema")
const brand = require("../models/brandSchema")
const category = require("../models/categorySchema")
const cart = require("../models/cartSchema")
const user = require("../models/userSchema")
const order = require("../models/orderSchema")
const wallet = require("../models/walletSchema")
const flash = require("express-flash")
const crypto = require("crypto")
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

var instance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY,
});

module.exports = {

    //online Payment Post for order creation
    onlineCheckOut: async (req, res) => {
        try {
            const addressId = req.session.address    //shipping address id from the body            
            const paymentMethod = req.body.payment //payment method from the body 
            let total = 0
            if (req.session.amounttopay === 0 || !req.session.amounttopay) {
                total = req.session.grantTotal          //total amount from session
            } else {
                total = req.session.amounttopay
            }

            // const total = req.session.grantTotal  //total amount from session
            const quantity = req.session.totalQuantity    //total quantity from session 
            const userId = req.session.userId     //user id from session

            console.log("test paymenttttttt")
            const newUser = await user.findById({ _id: userId })     //finding user            
            const dbAddress = newUser.address     //placind address id from user to dbAddress
            const newCart = await cart.findOne({ userId: userId })   //getting the cart id from user id           
            const shipAddress = dbAddress.find((item) => item._id.equals(addressId))    //comparing shipping address from body with the db address id
            //updating the order in database            
            if (shipAddress) {
                const add = {
                    name: shipAddress.name,
                    addressLane: shipAddress.addressLane,
                    pincode: shipAddress.pincode,
                    city: shipAddress.city,
                    state: shipAddress.state,
                    mobile: shipAddress.mobile,
                    altMobile: shipAddress.altMobile
                }
                let couponDiscount = 0
                if (req.session.couponDiscount != 0) {
                    couponDiscount = req.session.couponDiscount
                }
                const newOrder = new order({
                    userId: userId,
                    status: "Order Placed",
                    items: newCart.items,
                    paymentMethod: "Online",
                    orderDate: new Date(),
                    deliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),//four days (4 * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds).
                    totalAmount: total,
                    totalQuantity: quantity,
                    paymentStatus: "Paid",
                    couponDiscount: couponDiscount,
                    address: add
                })
                const currentOrder = await newOrder.save()  //saving the new order to database
                await cart.findByIdAndDelete({ _id: newCart._id }) //finding the card and deleting the cart               

                //updating the stock when order is placed
                for (item of currentOrder.items) {
                    const productId = item.productId
                    const quantity = item.quantity
                    const newProduct = await product.findById(productId)
                    if (newProduct) {
                        const newQuantity = newProduct.stock - quantity
                        if (newQuantity <= 0) {
                            newProduct.stock = 0
                            newProduct.status = "Out of Stock"
                            await newProduct.save()
                        } else {
                            newProduct.stock = newQuantity
                            await newProduct.save()
                        }
                    }
                }
                req.flash("success", "your order has been place succesfully. Please visit order tab for details")
                // res.render("./user/orderSuccess")
                res.json({ success: true })
            }
            else {
                req.flash("error", "shipping address and payment method need not be blank")
                res.redirect("/checkOut")
            }
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },

    createOrder: async (req, res) => {
        try {
            const addressID = req.query.addressID;
            const paymentMethods = req.query.paymentMethod;
            // console.log(addressID);
            // console.log(paymentMethods);
            // console.log('@!!!@@');
            req.session.address = addressID;
            let total = 0
            if (req.session.amounttopay === 0 || !req.session.amounttopay) {
                total = req.session.grantTotal          //total amount from session
            } else {
                total = req.session.amounttopay
            }

            //const total = req.session.grantTotal;



            // console.log(total);
            var options = {
                amount: total * 100,
                currency: "INR",
                receipt: "order_rcptid_11",
            };
            const order = await instance.orders.create(options);
            return res.json({ success: true, order, messsge: '@@@@@' });
        } catch (error) {
            console.error(error);
            return res.status(500).send("Error in creating order");
        }
    },

    verifyPayment: async (req, res) => {
        let hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY);
        hmac.update(
            req.body.payment.razorpay_order_id +
            "|" +
            req.body.payment.razorpay_payment_id
        );
        hmac = hmac.digest("hex");
        if (hmac === req.body.payment.razorpay_signature) {
            const orderId = req.body.order.receipt;
            const orderID = req.body.orderId;
            // const updateOrderDocument = await order.findByIdAndUpdate(orderID, {
            //     PaymentStatus: "Paid",
            //     paymentMethod: "Online",
            // });           
            res.json({ success: true });
        } else {
            res.json({ failure: true });
        }
    },

    postCheckOut: async (req, res) => {
        try {
            const addressId = req.body.address            //shipping address id from the body
            const paymentMethod = req.body.payment        //payment method from the body 
            let total = 0
            if (req.session.amounttopay === 0 || !req.session.amounttopay) {
                total = req.session.grantTotal          //total amount from session
            } else {
                total = req.session.amounttopay
            }

            const walletTotal = req.session.walletAmount  //wallet total from the session
            const checkTotal = walletTotal - total          //total vs wallet amount check          
            const quantity = req.session.totalQuantity    //total quantity from session 
            const userId = req.session.userId             //user id from session
            const newUser = await user.findById({ _id: userId })     //finding user            
            const dbAddress = newUser.address                     //placing address id from user to dbAddress
            const newCart = await cart.findOne({ userId: userId })   //getting the cart id from user id           
            const shipAddress = dbAddress.find((item) => item._id.equals(addressId))    //comparing shipping address from body with the db address id
            //updating the order in database for COD

            if (paymentMethod === "walletPayment" && checkTotal < 0) {
                req.flash("error", "you dont have enough balance in your wallet. pls try other payment method")
                res.redirect("/getCart")

            } else {

                if (shipAddress && paymentMethod) {
                    const add = {
                        name: shipAddress.name,
                        addressLane: shipAddress.addressLane,
                        pincode: shipAddress.pincode,
                        city: shipAddress.city,
                        state: shipAddress.state,
                        mobile: shipAddress.mobile,
                        altMobile: shipAddress.altMobile
                    }
                    let method = "", pay = ""
                    if (paymentMethod == "COD") {
                        method = "COD"
                        pay = "Pending"
                    } else {
                        method = "Wallet"
                        pay = "Paid"
                    }
                    let couponDiscount = 0
                    if (req.session.couponDiscount != 0) {
                        couponDiscount = req.session.couponDiscount
                    }

                    const newOrder = new order({
                        userId: userId,
                        status: "Order Placed",
                        items: newCart.items,
                        paymentMethod: method,
                        orderDate: new Date(),
                        deliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),//four days (4 * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds).
                        totalAmount: total,
                        totalQuantity: quantity,
                        paymentStatus: pay,
                        couponDiscount: couponDiscount,
                        address: add
                    })

                    const currentOrder = await newOrder.save()  //saving the new order to database
                    await cart.findByIdAndDelete({ _id: newCart._id }) //finding the card and deleting the cart

                    if (paymentMethod == "walletPayment") {
                        const newWallet = new wallet({
                            userId: userId,
                            orders: currentOrder._id,
                            status: "Debit",
                            totalAmount: currentOrder.totalAmount
                        })
                        await newWallet.save()
                    }

                    //updating the stock when order is placed
                    for (item of currentOrder.items) {
                        const productId = item.productId
                        const quantity = item.quantity
                        const newProduct = await product.findById(productId)
                        if (newProduct) {
                            const newQuantity = newProduct.stock - quantity
                            if (newQuantity <= 0) {
                                newProduct.stock = 0
                                newProduct.status = "Out of Stock"
                                await newProduct.save()
                            } else {
                                newProduct.stock = newQuantity
                                await newProduct.save()
                            }
                        }
                    }
                    req.flash("success", "your order has been place succesfully. Please visit order tab for details")
                    res.render("./user/ordersuccess")
                    delete req.session.amounttopay
                } else {
                    req.flash("error", "shipping address and payment method need not be blank")
                    res.redirect("/checkOut")
                }
            }
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    },
}


