const mongoose=require("mongoose")

const offerSchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
        unique: true,
    },
    discount: {
        type: Number,
        required: true,
    },
    valid_from: {
        type: Date,
        required: true,
    },
    valid_to: {
        type: Date,
        required: true,
    },
    status: {
        type:String,
        default:"Active",
        required:true
    }
});

const offer = mongoose.model('offer', offerSchema);

module.exports = offer;
