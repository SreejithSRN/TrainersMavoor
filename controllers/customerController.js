const User=require("../models/userSchema")
const flash=require("express-flash")

module.exports={

    getCustomer:async(req,res)=>{
        const page = parseInt(req.query.page) || 1; // Get the page number from query parameters
        const perPage = 5; // Number of items per page
        const skip = (page - 1) * perPage;
        const user = await User.find({}).sort({name:1}).skip(skip).limit(perPage);
        const totalCount = await User.countDocuments();
        res.render("./admin/customer", {
        user,
        currentPage: page,
        perPage,
        totalCount,
        totalPages: Math.ceil(totalCount / perPage),
      });        
    },

    blockUser:async(req,res)=>{
        try {
            const {id}=req.params
            const userData=await User.findOne({_id:id})
            if(userData.status==="Active"){
                const user=await User.findByIdAndUpdate(id,{status:"Blocked"})
                res.redirect("/customer")
            }else if(userData.status==="Blocked"){
                const user1=await User.findByIdAndUpdate(id,{status:"Active"})
                res.redirect("/customer")
            }            
        } catch (error) {
            console.log(error)            
        }
    },



}