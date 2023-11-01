const category=require("../models/categorySchema")
const flash=require("express-flash")

module.exports={
    getAddCategory:(req,res)=>{
        res.render("./admin/addCategory")
    },
    addCategory:async(req,res)=>{
        try {
            const name=req.body.name;       
            const brands=await category.findOne({name:name})       
            if(brands){
                console.log("category already in the db")
                req.flash("error","Category already exists")
                res.redirect("/addCategory")
               
            }else{
                await category.create(req.body)
                res.redirect("/category")
            }        
        } catch (error) {
            console.log(error)
            
        } 
    },
    getCategory:async(req,res)=>{
        const page = parseInt(req.query.page) || 1; // Get the page number from query parameters
        const perPage = 5; // Number of items per page
        const skip = (page - 1) * perPage;
        const cat = await category.find({}).sort({name:1}).skip(skip).limit(perPage);
        const totalCount = await category.countDocuments();
        res.render("./admin/category", {
        cat,
        currentPage: page,
        perPage,
        totalCount,
        totalPages: Math.ceil(totalCount / perPage),
      });      
    },
    deleteCategory:async(req,res)=>{
        const {id}= req.params
        const delCategory=await category.findOneAndDelete({_id:id})
        res.redirect("/category")
    },
    editCategory: async(req,res)=>{
        const{id}=req.params
        const editCategory=await category.findById({_id:id}) 
        res.render("./admin/editCategory",{editCategory})

    },
    editedCategory:async(req,res)=>{
        const {id}=req.params
        const{name}=req.body
        const catUpdate=await category.findByIdAndUpdate({_id:id},{name:name})        
        res.redirect("/category")

    }


}