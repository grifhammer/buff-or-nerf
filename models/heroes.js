//models/heroes.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var heroSchema = new Schema({
    image: String,
    buffVotes: Number,
    nerfVotes: Number
});

module.exports = mongoose.model('heroes',heroSchema);
