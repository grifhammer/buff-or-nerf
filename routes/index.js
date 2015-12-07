var express = require('express');
var router = express.Router();


var mongoClient = require('mongodb').MongoClient;

/* GET home page. */
router.get('/', function(req, res, next) {

    mongoClient.connect('mongodb://localhost:27017/buffornerf', function(error, db){
        db.collection('teams').find().toArray(function (error, result){
            console.log(result);
        });
    });

    //index page should load random item
    //1. Get all items from mongoDB
    //2. Get current user from mongoDB via req.ip
    //3. Find photos user hasnt voted on
    //4. load all of the items from 3 to an array
    //5. choose random item from the array and set it to a var
    //6. res.render() the index view and send it the photo
    
  res.render('index', { title: 'Express' });
});

module.exports = router;
