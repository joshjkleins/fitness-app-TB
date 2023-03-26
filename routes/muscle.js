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

// sends list of the db muscles to the client 
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

// sends the list of equipment for a muscle to the client after selecting a muscle
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
            // check if database has muscle/equipment/exerciseNames entry in collection; if not, create one 
            const newExerciseNameObject = {
                muscle: req.params.muscle,
                equipment: req.params.equipment,
                exerciseNames: []
            }
            await collection.insertOne(newExerciseNameObject)
            console.log(`I created a new document for ${req.params.muscle} and ${req.params.equipment} `)
            res.render("exercises", {
                muscle: req.params.muscle,
                equipment: req.params.equipment,
                exerciseNames: []
            })

        } else {
            // if muscle/equipment already exists in db, load it 
            res.render("exercises", {
                muscle: req.params.muscle,
                equipment: req.params.equipment,
                exerciseNames: result.exerciseNames
            })
        }
    }
    getExercises()

})

// adds a new exercise to a muscle/equipment 
router.post('/:muscle/:equipment/addExercise', (req, res) => {
    
    if (req.body.newExercise == '') {
        //request user to enter a string
        console.log('Null input was rejected!')
        return res.redirect('/:muscle/:equipment')
    }
    // define newExercise 
    const addExercise = req.body.newExercise.toLowerCase().trim()
    console.log(addExercise)

    async function addingExercise() {
        // connect to database
        const client = await MongoClient.connect(process.env.MDBURL, { useUnifiedTopology: true })
        
        // get correct database and collection
        const dbName = client.db('Fitness')
        const collection = dbName.collection('Exercises')
               
        // if muscle/equipment/exerciseName document exists, check to see if exerciseName already exists 
        const result = await collection.findOne({
            muscle: req.params.muscle,
            equipment: req.params.equipment,
            exerciseNames: addExercise,
        })
        
        // if exerciseName does not exist, add it to the array
        if (result == null) {
            const addedExerciseName = await collection.updateOne({
                muscle: req.params.muscle,
                equipment: req.params.equipment,}, 
                {$push: { 'exerciseNames': addExercise}
            })
            console.log(addedExerciseName)
            res.redirect('/muscle/'+req.params.muscle+"/"+req.params.equipment)
        } 
        // if the exerciseName exists, redirect 
        else {
            console.log(`${addExercise} already exists in the database`)
            return res.redirect('/muscle/'+req.params.muscle+"/"+req.params.equipment)
        }
    }
    addingExercise()
})

router.post('/:muscle/:equipment/:exercise/update', (req,res) => {
       
    const updateExer = req.body.update.toLowerCase().trim()
    console.log(updateExer)

    async function updateExercise() {
        // connect to database
        const client = await MongoClient.connect(process.env.MDBURL, { useUnifiedTopology: true })
        
        // get correct database and collection
        const dbName = client.db('Fitness')
        const collection = dbName.collection('Exercises')
               
        // if muscle/equipment/exerciseName document exists, check to see if exerciseName already exists 
        const result = await collection.findOne({
            muscle: req.params.muscle,
            equipment: req.params.equipment,
        })

        const addedExerciseName = await collection.updateOne(
            {muscle: req.params.muscle,
            equipment: req.params.equipment,
            exerciseNames: req.params.exercise},
            { $set: {'exerciseNames.$':updateExer}})

        res.redirect('/muscle/'+req.params.muscle+"/"+req.params.equipment)
    }
    updateExercise()
})

router.post('/:muscle/:equipment/:exercise/delete', (req,res) => {
    
    async function deleteExercise() {
        // connect to database
        const client = await MongoClient.connect(process.env.MDBURL, { useUnifiedTopology: true })
        
        // get correct database and collection
        const dbName = client.db('Fitness')
        const collection = dbName.collection('Exercises')
               
        // if muscle/equipment/exerciseName document exists, check to see if exerciseName already exists 
        const result = await collection.findOne({
            muscle: req.params.muscle,
            equipment: req.params.equipment,
        })

        const addedExerciseName = await collection.updateOne({
            muscle: req.params.muscle,
            equipment: req.params.equipment,}, 
            {$pull: { 'exerciseNames': req.params.exercise}
        })
        res.redirect('/muscle/'+req.params.muscle+"/"+req.params.equipment)
    }
    deleteExercise()
})

// kills all active connection is 500 connections max is met
// const client = await MongoClient.connect(process.env.MDBURL, { useUnifiedTopology: true })
// const dbName = client.db('Fitness')
// dbName.runCommand( { killAllSessions: [ ] } )

module.exports = router
