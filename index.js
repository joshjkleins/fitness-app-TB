const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const MongoClient = require('mongodb').MongoClient
require('dotenv').config()

//setting view engine to ejs
app.set("view engine", "ejs");

// Allows req.body data to come through
app.use(bodyParser.urlencoded({ extended: true }))

// Servers home page html
app.get('/', function(req, res){
    res.render("index") 
})

app.get('/muscle', function(req, res) {
    async function getMuscles() {
        const client = await MongoClient.connect(process.env.MDBURL, { useUnifiedTopology: true })
        console.log('Connected to Database')
        // get correct database and collection
        const dbName = client.db('Fitness')
        const collection = dbName.collection('Equipment')
        const result = await collection.find({}).toArray()
        res.render("muscle", {
            muscle: result
        })
    }
    getMuscles()
    
})

// Equipement form post
app.post('/muscle', function(req, res){ 
    if (req.body.equipmentName == '' || req.body.muscle == '') {
        //request user to enter a string
        console.log('Null input was rejected!')
        return res.redirect('/')
    }
    // update equipment string to array
    const equipment = req.body.equipmentName.toLowerCase().trim()
    const muscle = req.body.muscle.toLowerCase().trim()
    const equipmentArray = equipment.split(', ')

    // make db document object
    const equipmentObject = {
        muscle: muscle,
        equipment: equipmentArray
    }
    
    async function addingExercise() {
        // connect to database
        const client = await MongoClient.connect(process.env.MDBURL, { useUnifiedTopology: true })
        console.log('Connected to Database')
        // get correct database and collection
        const dbName = client.db('Fitness')
        const collection = dbName.collection('Equipment')

        // setting a database query to a variable to see if muscle already exists in database 
        const result = await collection.findOne({muscle: muscle})
        // if no result exists, insert new muscle into database
        if (result == null) {
            collection.insertOne(equipmentObject).then(result => {
                console.log(result)
                res.redirect('/')
            })
        } else {
            console.log(muscle + ' is already in database')
            res.redirect('/')
        }
    }
    addingExercise()
})

app.listen(process.env.PORT)


