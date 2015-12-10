var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

var mainDbUrl;
if(process.env.PROD_MONGODB){
    mainDbUrl = process.env.PROD_MONGODB;
}else{
    mainDbUrl = 'mongodb://localhost:27017/buffornerf'
}

mongoose.connect(mainDbUrl);
var Hero = require('../models/heroes');
var User = require('../models/users')


function getJSON(res, model){
    model.find(function (err, result){
        if(err){
            console.log(err);
        }
        else{
            res.json(result);
        }
    });
}

router.get('/heroes/get', function (req, res, next){
    Hero.find(function(err, heroesResult){
        if (err){
            console.log(err);
        }
        else{
            res.json(heroesResult);
        }
    });
});

router.get('/users/get', function (req, res, next){
    User.find(function (err, usersResult){
        if(err){
            console.log(err);
        }
        else{
            res.json(usersResult);
        }
    })
});

module.exports = router;

