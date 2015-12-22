//models/heroes.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var usersSchema = new Schema({
    id: String,
    vote: String,
    hero: Number
});

module.exports = mongoose.model('users', usersSchema);
