const bcrypt=require("bcrypt")
const Admin=require("../models/adminSchema")
// const mongoose=require("mongoose")
const brand=require("../models/brandSchema")
const category=require("../models/categorySchema")
const flash=require("express-flash")


module.exports={
    admin:(req,res)=>{
        try {  
            if(req.session.logined){
                res.redirect("/admindashboard")
            }else{
                res.render("./admin/login")

            }
           
        } catch (error) {
            console.log(error)
            
        }
    },
    adminLogin:(req,res)=>{
        try {
            const credential = {
                //setting credential for admin
                email: "admin@gmail.com",
                password: 1,
              };
              const { email, password } = req.body;
              //checking the entered email and password
              if (email == credential.email && password == credential.password) {
                req.session.user=email
                req.session.logined=true
            res.redirect("/admindashboard")
              }else{
                req.flash("error","Invalid Credentials")
                res.redirect("/admin")
              }
            
        } catch (error) {
            console.log(error);
            
        }
    },
    dashboardGet:(req,res)=>{
        if(req.session.logined){
        res.render("./admin/dashboard")
        }else{
            res.redirect("/admin")
        }
        
    },
   
    
//     getProduct:(req,res)=>{
//         res.render("./admin/products")
// },
   
    getLogout:(req,res)=>{
       
        req.session.logined=false
        req.session.destroy
        res.redirect("/admin")
    },



}