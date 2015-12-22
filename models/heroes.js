//models/heroes.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var heroSchema = new Schema({
    id: Number,
    localized_name: String,
    imageBase: String,
    buffVotes: Number,
    nerfVotes: Number
});

module.exports = mongoose.model('heroes',heroSchema);
