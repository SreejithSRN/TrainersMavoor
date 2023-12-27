const product = require("../models/productSchema");
const offer = require("../models/offerSchema");
const cron = require("node-cron");
const Category = require("../models/categorySchema");



const checkOffer = async () => {
  try {
    const currentDate = new Date();
    const offers = await offer.find({ expiryDate: { $lte: currentDate } });
    if (offers.length > 0) {
      for (const x of offers) {
        let name=x.categoryName




        
      }
    }
  } catch (error) {
    console.error("Error in the cron job:", error);
    throw error;
  }
};

cron.schedule("*/10 * * * * *", async () => {
  try {
    await checkOffer();
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});

















































// const checkOffer = async () => {
//     try {
//       const currentDate = new Date();
//       const offers = await offer.find({ expiryDate: { $lte: currentDate } });
//       if (offers.length > 0) {
//         for (const x of offers) {
//           const categoryname = await Category.findOne({name: x.categoryName,});
//           const categoryName = categoryname.catagoryName;
//           const previousDiscounts = {};
//           const productsToUpdate = await product.find({ Category: categoryName });
  
//           productsToUpdate.forEach((product) => {
//             previousDiscounts[product._id] = product.DiscountAmount;
//           });
  
//           const discountAmounts = off.discount;
  
//           const discountAmount =
//             productsToUpdate[0].beforeOffer * (discountAmounts / 100);
  
//           const products = await product.updateMany(
//             { Category: categoryName },
//             {
//               $inc: { DiscountAmount: discountAmount },
//               $set: {
//                 IsInCategoryOffer: false,
//                 categoryOffer: undefined,
//               },
//             }
//           );
  
//           await offer.deleteOne({ _id: off._id });
//         }
//       }
//     } catch (error) {
//       console.error("Error in the cron job:", error);
//       throw error;
//     }
//   };
  
//   cron.schedule("*/10 * * * * *", async () => {
//     try {
//       await checkOffer();
//     } catch (error) {
//       console.error("Error in cron job:", error);
//     }
//   });
  