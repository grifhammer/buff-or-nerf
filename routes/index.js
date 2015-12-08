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
        db.collection('users').find({'ip': req.ip}).toArray(function (error, result){
            var previousVotes = result
            var previousVoteIds = []
            for(var resultIndex = 0; resultIndex < previousVotes.length; resultIndex++){
                previousVoteIds.push(parseInt(previousVotes[resultIndex].hero));
            }
            db.collection('heroes').find({'id': { $nin: previousVoteIds} }).toArray(function (error, result){
                console.log(result.length);
                if(result.length == 0){
                    res.render('thanks');
                }
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
});

router.get('/standings', function(req, res, next){
    mongoClient.connect('mongodb://localhost:27017/buffornerf', function (error, db){
        db.collection('users').find().toArray(function (error, result){
            
            var userVotes = result;
            var voteCount = [];
            for(var userIndex = 0; userIndex < userVotes.length; userIndex++){
                var userVote = userVotes[userIndex];
                if(userVote.vote === "buff"){
                    if(voteCount[userVote.hero]){
                        voteCount[userVote.hero]++;
                    }
                    else{
                        voteCount[userVote.hero] = 1;
                    }
                }else if(userVote.vote === "nerf"){
                    if(voteCount[userVote.hero]){
                        voteCount[userVote.hero]--;
                    }
                    else{
                        voteCount[userVote.hero] = -1
                    }
                }
            }
            console.log(voteCount);
            db.collection('heroes').find().toArray(function (error, result){
                result.sort( function(a, b){
                    if(voteCount[a.id] && voteCount[b.id]){
                        return voteCount[b.id] - voteCount[a.id]
                    }
                    else if(voteCount[a.id]){
                        return -1;
                    }
                    else if(voteCount[b.id]){
                        return 1;
                    }
                    else{
                        return 0;
                    }
                });
                res.render('standing', {heroes: result});
            });
        });
    });
    //1. get ALL items
    //2. Sort them by highest likes
    //3. res.resnder the standings view and pass it the sorted photo array
});

function addVote(voteVal, req){
    var heroId = parseInt(req.body.heroId);
    mongoClient.connect('mongodb://localhost:27017/buffornerf', function (error, db){
        db.collection('users').insertOne( {
            ip: req.ip,
            vote: voteVal,
            hero: heroId
        });
    });
}

router.post('/buff', function (req, res, next){
    addVote('buff', req);
    res.redirect('../');
});

router.post('/nerf', function (req, res, next){
    addVote('nerf', req);
    res.redirect('../');
});

module.exports = router;

