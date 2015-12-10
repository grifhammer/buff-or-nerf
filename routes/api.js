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


function serveJson(res, model){
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
    serveJson(res, Hero);
});

router.get('/users/get', function (req, res, next){
    serveJson(res, User);
});

module.exports = router;

