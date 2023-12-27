const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, uppercase: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    status: { type: String, default: "Active" },
    address: [{
        name: {
            type: String, uppercase: true
        },
        addressLane: {
            type: String, uppercase: true
        },
        city: {
            type: String, uppercase: true
        },
        pincode: {
            type: Number
        },
        state: {
            type: String, uppercase: true
        },
        mobile: {
            type: Number
        },
        altMobile: {
            type: Number
        }
    }],
    usedCoupons: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' }], default: [] },

    referedAmount: {
        type: Number,
        default: 0
      },
      referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      referredUsers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],

})

const userModel = mongoose.model("User", userSchema)
module.exports = userModel
