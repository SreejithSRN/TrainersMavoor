const express=require("express")
const app=express()
const path=require("path")
require("dotenv").config()
const userRoute=require("./routers/userRoute")
const adminRoute=require("./routers/adminRoute")
const db=require("./config/db")
const user=require("./models/userSchema")
const userController = require("./controllers/userController")
const flash=require("express-flash")
const session = require("express-session")
const nocache=require("nocache")
const morgan=require('morgan')

app.use(express.static("public"))

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(nocache())


app.use(session({
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:false
})
)
app.use(flash())
// app.use(morgan('tiny'))

app.set(express.static(path.join(__dirname,"views")))
app.set("view engine","ejs")

app.use("/", userRoute)
app.use("/",adminRoute)



// app.use((err,req,res,next)=>{
//     console.log(err.stack);
//     res.render('errorpage')
// })

// app.use("*", (req,res) => {
//     res.render('errorpage')
//   })

const PORT=process.env.PORT


app.listen(PORT,()=>{console.log(`Server connected on http://localhost:${PORT}`, `Server connected on http://localhost:${PORT}/admin`)})
