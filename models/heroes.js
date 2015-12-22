//models/heroes.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var heroSchema = new Schema({
    id: Number,
    localized_name: String,
    img: String,
    buffVotes: {type: Number, default: 0},
    nerfVotes: {type: Number, default: 0},
    totalVotes: {type:Number, default: 0}
});

module.exports = mongoose.model('heroes', heroSchema);
