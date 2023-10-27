const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        uppercase:true
    }
});

const brand = mongoose.model("brand", brandSchema);

module.exports = brand;
