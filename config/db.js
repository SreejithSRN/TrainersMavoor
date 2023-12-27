const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.mongourl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Database Connected Successfully:", process.env.mongourl);
}).catch((err) => {
    console.log(err);
});
