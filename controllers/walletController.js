const order = require("../models/orderSchema")
const wallet = require("../models/walletSchema")
const product = require("../models/productSchema")
const User=require("../models/userSchema")

module.exports = {
    getUserWallet: async (req, res) => {
        try {
            const userId = req.session.userId
            const newWallet = await wallet.find({ userId: userId }).populate('orders')
            // console.log(newWallet);
            let debitAmount = 0, creditAmount = 0, walletTotal = 0
            for (x of newWallet) {
                if (x.status === "Debit") {
                    debitAmount += x.totalAmount
                } else if (x.status === "Credit") {
                    creditAmount += x.totalAmount
                }
            }
            const walletamounts=await User.findOne({_id:userId})
            walletTotal = creditAmount + walletamounts.referedAmount - debitAmount
            // walletTotal = creditAmount - debitAmount
            req.session.walletAmount = walletTotal
            // console.log(req.session.walletAmount);
            res.render("./user/userwallet", { newWallet, walletTotal,walletamounts })
        } catch (error) {
            console.log(error);
            res.status(500).render("error500", { message: "Internal Server Error" })
        }
    }
}