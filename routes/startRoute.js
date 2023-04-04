const express = require('express')
const router = express.Router()
const MongoClient = require('mongodb').MongoClient


// allow for template workouts
// allow for workouts to be created ad hoc by directing to the muscles page and having user either click on a muscle/equipment/exercise 
// or allow for a workout to be created by directly clicking on an exercise and adding it to a workout 

router.get('/', function(req, res) {
    res.render('startworkout')
    
})

module.exports = router
