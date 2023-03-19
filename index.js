const express = require('express')
const bodyParser = require('body-parser')
const app = express()
require('dotenv').config()

//setting view engine to ejs
app.set("view engine", "ejs");

// Allows req.body data to come through
app.use(bodyParser.urlencoded({ extended: true }))

// Allows for use of css file
app.use(express.static('public'))

// Servers home page html
app.get('/', function(req, res){
    res.render("index") 
})

// update home page to mirror final style format
// create list of master muscles and equipment for incorporation into drop-down menu
// 

const muscleRouter = require('./routes/muscle')

app.use('/muscle', muscleRouter)

app.listen(process.env.PORT)
