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

app.set(express.static(path.join(__dirname,"views")))
app.set("view engine","ejs")

app.use("/", userRoute)
app.use("/",adminRoute)

const PORT=process.env.PORT


app.listen(PORT,()=>{console.log(`Server connected on http://localhost:${PORT}`)})