const express = require('express')
const router = express.Router()
const MongoClient = require('mongodb').MongoClient

router.get('/', function(req, res) {
    res.render("muscle")
})

router.get('/get-all-exercises', (req, res) => {
    async function allExercises() {
        const client = await MongoClient.connect(process.env.MDBURL, { useUnifiedTopology: true })
        console.log('Connected to Database')
        // get correct database and collection
        const dbName = client.db('Fitness')
        const collection1 = dbName.collection('Equipment')
        const resultMuscle = await collection1.find({}).toArray()
        const justMuscles = resultMuscle.map((m) => {
            return m.muscle
        })
        
        const collection2 = dbName.collection('Exercises')
        const resultAllExercises = await collection2.find({}).toArray()
        let listArray = [];
        resultAllExercises.forEach(function(i) {
            if (i.exerciseNames.length != 0) {
                i.exerciseNames.forEach(j => {
                    listArray.push(`${j} (${i.equipment}, ${i.muscle})`)
                });
            }
        })
        client.close()
        const result = {
            muscle: justMuscles,
            listArray: listArray
        }
        
        res.send(result)
    }
    allExercises()
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
        result.forEach(function(i) {
            if (i.exerciseNames.length != 0) {
                i.exerciseNames.forEach(j => {
                    listArray.push(`${j} (${i.equipment})`)
                });
            }
        })
    
        client.close()

        res.render("listByMuscle", {
            muscle: req.params.muscle,
            muscleList: `You are the viewing all exercises for ${req.params.muscle}`,
            listArray: listArray,
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
        result.forEach(function(i) {
            if (i.exerciseNames.length != 0) {
                i.exerciseNames.forEach(j => {
                    listArray.push(`${j} (${i.muscle})`)
                });
            }
        })
        res.render("listByEquipment", {
            equipmentList: `You are the viewing the all exercises for ${req.params.equipment}`,
            listArray: listArray
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
