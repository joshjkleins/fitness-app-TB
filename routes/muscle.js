const express = require('express')
const router = express.Router()
const MongoClient = require('mongodb').MongoClient

router.get('/', function(req, res) {
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
router.post('/', function(req, res){ 
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

router.get('/:muscle', (req, res) => {
    async function getEquipmentForMuscle() {
        const client = await MongoClient.connect(process.env.MDBURL, { useUnifiedTopology: true })
        
        // get correct database and collection
        const dbName = client.db('Fitness')
        const collection = dbName.collection('Equipment')
        const result = await collection.findOne({
            muscle: req.params.muscle
        })
        if (result == null) {
            res.render("equipment", {
                muscle: req.params.muscle,
                muscleNameMessage: 'No muscle named '+req.params.muscle+' exists. Please try again.',
                equipment: ''
            }) 
        } else {
            res.render("equipment", {
                muscle: req.params.muscle,
                muscleNameMessage: `You are the viewing the equipment list for ${req.params.muscle}`,
                equipment: result.equipment
            })
        }
    }
    getEquipmentForMuscle()
    
})

router.get('/:muscle/:equipment', (req, res) => {
    async function getExercises() {
        const client = await MongoClient.connect(process.env.MDBURL, { useUnifiedTopology: true })
        
        // get correct database and collection
        const dbName = client.db('Fitness')
        const collection = dbName.collection('Exercises')
        
        const result = await collection.findOne({
            muscle: req.params.muscle,
            equipment: req.params.equipment
        })
        if (result == null) {
            res.render("exercises", {
                muscle: req.params.muscle,
                equipment: req.params.equipment,
                exerciseNames: ''
            }) 
        } else {
            res.render("exercises", {
                muscle: req.params.muscle,
                equipment: req.params.equipment,
                exerciseNames: result.exerciseNames
            })
        }
    }
    getExercises()
})

router.post('/exercise', (req, res) => {
    console.log(req.body.newExercise)
    // connect to the db
    // query the muscle and equipment 
    // 
    // if array is empty, add exercise to array 

})

module.exports = router
