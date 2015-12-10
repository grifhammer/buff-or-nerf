var express = require('express');
var router = express.Router();


var mongoClient = require('mongodb').MongoClient;
var db;

var mainDbUrl;
if(process.env.PROD_MONGODB){
    mainDbUrl = process.env.PROD_MONGODB;
}else{
    mainDbUrl = 'mongodb://localhost:27017/buffornerf'
}


mongoClient.connect(mainDbUrl, function(error, database){
    db = database;
});

/* GET home page. */
router.get('/', function (req, res, next) {

    //index page should load random item
    //2. Get current user from mongoDB via req.ip
    //3. Find photos user hasnt voted on
    var ipAddr = getIp(req);
    db.collection('users').find({id: ipAddr}).toArray(function (error, result){
        var previousVotes = result
        var previousVoteIds = []
        for(var resultIndex = 0; resultIndex < previousVotes.length; resultIndex++){
            previousVoteIds.push(parseInt(previousVotes[resultIndex].hero));
        }
        db.collection('heroes').find({'id': { $nin: previousVoteIds} }).toArray(function (error, result){
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

router.get('/standings', function(req, res, next){
        db.collection('users').find().toArray(function (error, result){
        
        var userVotes = result;
        var voteCount = [];
        for(var userIndex = 0; userIndex < userVotes.length; userIndex++){
            var userVote = userVotes[userIndex];
            // if current vote is to buff add one
            if(userVote.vote === "buff"){
                // double check that the value has been initialized before incrementing
                if(voteCount[userVote.hero]){
                    voteCount[userVote.hero]++;
                }
                else{
                    voteCount[userVote.hero] = 1;
                }
            // else if its a vote for nerf subtract one
            }else if(userVote.vote === "nerf"){
                // double check that the value has been initialized before incrementing
                if(voteCount[userVote.hero]){
                    voteCount[userVote.hero]--;
                }
                else{
                    voteCount[userVote.hero] = -1
                }
            }else if(userVote.vote === "balanced"){
                if(voteCount[userVote.hero]){
                    //Do nothing since the hero is balanced
                }else{
                    voteCount[userVote.hero] = 0
                }
            }
        }
        db.collection('heroes').find().toArray(function (error, result){

            //sort the heroes array based on their vote count totals
            result.sort( function(a, b){
                if(voteCount[a.id] != null && voteCount[b.id] != null){
                    if(voteCount[a.id] == voteCount[b.id]){
                        if(a.name < b.name){
                            return -1;
                        }
                        else if(b.name < a.name){
                            return 1;
                        }
                        else {
                            return 0;
                        }
                    }
                    else{    
                        return voteCount[b.id] - voteCount[a.id];
                    }
                }
                else if(voteCount[a.id]){
                    return -1;
                }
                else if(voteCount[b.id]){
                    return 1;
                }
                else{
                    if(a.name < b.name){
                        return -1;
                    }
                    else if(b.name < a.name){
                        return 1;
                    }
                }
            });
            res.render('standing', {heroes: result, votes: voteCount});
        });
    });
    //1. get ALL items
    //2. Sort them by highest likes
    //3. res.resnder the standings view and pass it the sorted photo array
});

function heroVoteSort(a, b){ 
}

function addVote(voteVal, req){
    var heroId = parseInt(req.body.heroId);
    var ipAddr = getIp(req);
    db.collection('users').find({id: ipAddr, hero: heroId}).toArray(function (error, result){
        if(result.length == 0){
            db.collection('users').insertOne( {
                id: ipAddr,
                vote: voteVal,
                hero: heroId
            });
            var changeObj = {};
            var voteType = voteVal + 'Votes';
            changeObj[voteType] = 1;
            db.collection('heroes').update({id: heroId}, {$inc: changeObj});
        }
    });
}


function getIp(req){
    var ipAddr = req.headers["x-forwarded-for"];
    if (ipAddr){
        var list = ipAddr.split(",");
        ipAddr = list[list.length-1];
    } else {
        ipAddr = req.connection.remoteAddress;
    }
    return ipAddr;
}


router.post('/buff', function (req, res, next){
    addVote('buff', req);
    res.redirect('../');
});

router.post('/balanced', function (req, res, next){
    addVote('balanced', req);
    res.redirect('../')
})

router.post('/nerf', function (req, res, next){
    addVote('nerf', req);
    res.redirect('../');
});

router.post('/new_user', function (req, res, next){
    var date = new Date();
    console.log(date.valueOf());
    var ipAddr = getIp(req);
    var newIP = ipAddr + ":" + date.valueOf();
    db.collection('users').update({id: ipAddr}, {$set: {id: newIP}}, {multi: true})
    res.redirect('../')
});

router.post('*', function (req, res, next){
    console.log("Wildcard Post Ran")
    res.redirect('../');
})



module.exports = router;

