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


module.exports = router;

