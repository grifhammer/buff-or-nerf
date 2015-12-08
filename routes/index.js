var express = require('express');
var router = express.Router();


var mongoClient = require('mongodb').MongoClient;

/* GET home page. */
router.get('/', function (req, res, next) {

    //index page should load random item
    //2. Get current user from mongoDB via req.ip
    //3. Find photos user hasnt voted on



    mongoClient.connect('mongodb://localhost:27017/buffornerf', function(error, db){
        //1. Get all items from mongoDB
        db.collection('heroes').find().toArray(function (error, result){
            db.collection('users').find({'ip': req.ip}).toArray(function (error, result){

            });
            var numHeroes = result.length;
            //5. choose random item from the array and set it to a var
            var thisIndex = Math.floor(Math.random() * numHeroes)
            //4. load all of the items from 3 to an array
            var heroes = result;
            //6. res.render() the index view and send it the photo
            res.render('index', {heroes: heroes[thisIndex] });
        });
    });
});

router.get('/standings', function(req, res, next){

    //1. get ALL items
    //2. Sort them by highest likes
    //3. res.resnder the standings view and pass it the sorted photo array
    res.render('index', {title: 'Standings'});
});

router.post('/buff', function (req, res, next){
    var heroId = req.body.heroId;
    var updatedBuffVotes = req.body.buffVotes + 1;
    mongoClient.connect('mongodb://localhost:27017/buffornerf', function(error, db){
        db.collection('users').insertOne( {
            ip: req.ip,
            vote: "buff",
            hero: heroId
        });
        res.redirect('../');
    });
    //This will run for all posted pages

});

router.post('/nerf', function (req, res, next){
    var heroId = req.body.heroId;
    var updatedBuffVotes = req.body.buffVotes + 1;
    mongoClient.connect('mongodb://localhost:27017/buffornerf', function(error, db){
        db.collection('users').insertOne( {
            ip: req.ip,
            vote: "nerf",
            hero: heroId
        });
        res.redirect('../');
    });
    //This will run for all posted pages

});

module.exports = router;

