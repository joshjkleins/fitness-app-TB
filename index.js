const express = require('express')
const bodyParser = require('body-parser')
const app = express()
require('dotenv').config()

//setting view engine to ejs
app.set("view engine", "ejs");

// Allows req.body data to come through
app.use(bodyParser.urlencoded({ extended: true }))

// Servers home page html
app.get('/', function(req, res){
    res.render("index") 
})

const muscleRouter = require('./routes/muscle')

app.use('/muscle', muscleRouter)

app.listen(process.env.PORT)
