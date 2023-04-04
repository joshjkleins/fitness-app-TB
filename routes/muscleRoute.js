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
        client.close()
        res.render("muscle", {
            muscle: result
        })
    }
    getMuscles()
})

router.get('/getExerciseNames', (req, res) => {
    async function getExercises() {
        const client = await MongoClient.connect(process.env.MDBURL, { useUnifiedTopology: true })
        
        // get correct database and collection
        const dbName = client.db('Fitness')
        const collection = dbName.collection('Exercises')
        
        const result = await collection.findOne({
            muscle: req.query.muscle,
            equipment: req.query.equipment
        })

        if (result == null) {
            // check if database has muscle/equipment/exerciseNames entry in collection; if not, create one 
            const newExerciseNameObject = {
                muscle: req.query.muscle,
                equipment: req.query.equipment,
                exerciseNames: []
            }
            await collection.insertOne(newExerciseNameObject)
            client.close()
            console.log(`I created a new document for ${req.query.muscle} and ${req.query.equipment} `)
            res.send({ name: 'exercissesess'})

        } else {
            // if muscle/equipment already exists in db, load it 
            client.close()
            const exerciseData = {
                muscle: result.muscle,
                equipment: result.equipment,
                exerciseNames: result.exerciseNames
            }
            res.send(exerciseData)
        }
    }
    getExercises() 
})

// lists all exercises for a muscle selected from the dropdown menu 
router.get('/musclelist/:muscle/', (req, res) => {
    async function getMuscleList() {
        const client = await MongoClient.connect(process.env.MDBURL, { useUnifiedTopology: true })
        
        // get correct database and collection
        const dbName = client.db('Fitness')
        const collection = dbName.collection('Exercises')
        const result = await collection.find({muscle: req.params.muscle}).toArray()
        let listArray = [];
        
        result.forEach(function(i, index) {
            if (i.exerciseNames.length != 0) {
                listArray.push(`${i.exerciseNames} (${i.equipment})` )
            }
        })

        // search in database for all documents that contain the muscle regardless of equipment
        // multiple the equipment to cover all respective exercises in that array (rdl, barbell; deadlift, barbell; etc.)
        // combine the exercise arrays into one 

        listArray.forEach(function(i, index) {
        })
        client.close()

        res.render("listByMuscle", {
            muscle: req.params.muscle,
            muscleList: `You are the viewing the all exercises for ${req.params.muscle}`,
            listArray: listArray,
            equipment: listArray
        })
    }   
    getMuscleList()
    
})

// lists all exercises for a muscle selected from the dropdown menu 
router.get('/equipment/:equipment/list', (req, res) => {
    async function getEquipmentList() {
        const client = await MongoClient.connect(process.env.MDBURL, { useUnifiedTopology: true })
        // get correct database and collection
        const dbName = client.db('Fitness')
        const collection = dbName.collection('Exercises')
        const result = await collection.find({equipment: req.params.equipment}).toArray()
        const listArray = []

        result.forEach(function(i, index) {
            if (i.exerciseNames.length != 0) {
                listArray.push(i.exerciseNames)
            }
        })

        res.render("listByEquipment", {
            equipmentList: `You are the viewing the all exercises for ${req.params.equipment}`,
            list: listArray.flat()
        })
    }   
    getEquipmentList()
    
})

// sends the equipment list for a selected muscle to the client 
router.get('/:muscle', (req, res) => {
    async function getEquipmentForMuscle() {
        const client = await MongoClient.connect(process.env.MDBURL, { useUnifiedTopology: true })
        
        // get correct database and collection
        const dbName = client.db('Fitness')
        const collection = dbName.collection('Equipment')
        const result = await collection.findOne({
            muscle: req.params.muscle
        })
        client.close()
        res.render("equipment", {
            muscle: req.params.muscle,
            muscleNameMessage: `You are the viewing the equipment list for ${req.params.muscle}`,
            equipment: result.equipment
        })
    }   
    getEquipmentForMuscle()   
})

// sends the list of equipment for a muscle to the client after selecting a muscle
router.get('/:muscle/:equipment', (req, res) => {
    res.render("exercises", {
        muscle: req.params.muscle,
        equipment: req.params.equipment
    })
})

// adds a new exercise to a :muscle/:equipment 
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
            client.close()            
            res.redirect('/muscle/'+req.params.muscle+"/"+req.params.equipment)
        } 
        // if the exerciseName exists, redirect 
        else {
            console.log(`${addExercise} already exists in the database`)
            client.close()
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
        
        client.close()

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
        client.close()
        res.redirect('/muscle/'+req.params.muscle+"/"+req.params.equipment)
    }
    deleteExercise()
})

module.exports = router
