const express = require('express')
const router = express.Router()
const MongoClient = require('mongodb').MongoClient


// create calendar page
// import perfectlist spreadsheet from host computer
// update code to change date is workout was completed 
// eventually, create database collection/format for storing exercise/sets/reps on a specific date
// import database and when clicking on date, workout/exercises/sets/reps are displayed on page
// also, have a scrollable page where the workouts are

router.get('/', function(req, res) {
    res.render('history')
    
})

module.exports = router
