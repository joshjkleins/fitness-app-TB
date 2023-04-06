const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const MongoClient = require('mongodb').MongoClient
require('dotenv').config()

//setting view engine to ejs
app.set("view engine", "ejs");

// Allows req.body data to come through
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Allows for use of css file
app.use(express.static('public'))

// Servers home page html
app.get('/', function(req, res){
    res.render("index") 
})

// update home page to mirror final style format
// create list of master muscles and equipment for incorporation into drop-down menu/by muscle/equipment (i.e. when hamstring is 
// selected, lists all hamstring exercises, when barbell is selected, list all barbell equipment exercises)
// include muscle picture photo
// update muscle and equipment pages to use fetch api to load html while also querying database 

const muscleRouter = require('./routes/muscleRoute')
const historyRouter = require('./routes/historyRoute')
const startRouter = require('./routes/startRoute')

app.use('/muscle', muscleRouter)
app.use('/history', historyRouter)
app.use('/start', startRouter)

app.listen(process.env.PORT)
