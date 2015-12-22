var express = require('express');

var router = express.Router();

var Hero = require('../models/heroes')
var User = require('../models/users')

// var mongoClient = require('mongodb').MongoClient;
var db;

/* GET home page. */
router.get('/', function (req, res, next) {

    //index page should load random item
    //2. Get current user from mongoDB via req.ip
    //3. Find photos user hasnt voted on
    var ipAddr = getIp(req);
    // console.log(ipAddr);
    User.find({id: ipAddr}, 'hero', function (err, docs){
        var previousVotes = docs;
        var previousVoteIds = [];
        previousVotes.map(function(vote){
            previousVoteIds.push(vote.hero)
        });
        Hero.find().where('id').nin(previousVoteIds).exec(function (err, docs){
            if(err){
                res.send(err);
            }else{
                if(docs.length ==0){
                    res.redirect('/thanks');
                }
                var numHeroes = docs.length;

                var thisIndex = Math.floor(Math.random() * numHeroes);

                var heroes = docs;

                var thisHero = heroes[thisIndex]

                res.render('index', {heroes: thisHero});
            }
        });
    });
});

router.get('/standings', function(req, res, next){
    Hero.find().exec(function (error, result){
        //sort the heroes array based on their vote count totals
        result.sort( heroVoteSort );
        res.render('standing', {heroes: result});
    });
    //1. get ALL items
    //2. Sort them by highest likes
    //3. res.resnder the standings view and pass it the sorted photo array
});

function heroVoteSort(heroA, heroB){ 
    if(heroA.totalVotes == heroB.totalVotes){
        if(heroA.localized_name < heroB.localized_name){
            return -1;
        }
        else if(heroB.localized_name < heroA.localized_name){
            return 1;
        }
        else {
            return 0;
        }
    }
    else{    
        return heroB.totalVotes - heroA.totalVotes;
    }
}

function addVote(voteVal, req){
    var heroId = parseInt(req.body.heroId);
    var ipAddr = getIp(req);
    User.findOneAndUpdate({id: ipAddr, hero: heroId}, {vote: voteVal}, {upsert: true, 'new': true}, function (error, result){
        if(error){
            console.log(error);
        }else{
                console.log(result)

            if(result){
                console.log(result)
                var changeObj = {};
                var voteType = voteVal + 'Votes';
                changeObj[voteType] = 1;
                if(voteVal == "buff"){
                    changeObj["totalVotes"] = 1;
                }else if(voteVal == "nerf"){
                    changeObj["totalVotes"] = -1;
                }else{
                    changeObj["totalVotes"] = 0;
                }
                Hero.findOneAndUpdate({id: heroId}, {$inc: changeObj}, {upsert: true, 'new': true}, function (error, result){
                    console.log(result);
                });
            }
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


router.get('/thanks', function (req, res, next){
    res.render('thanks');
});

router.post('/buff', function (req, res, next){
    addVote('buff', req);
    res.redirect('./');
});

router.post('/balanced', function (req, res, next){
    addVote('balanced', req);
    res.redirect('./')
})

router.post('/nerf', function (req, res, next){
    addVote('nerf', req);
    res.redirect('./');
});

router.post('/new_user', function (req, res, next){
    var date = new Date();
    console.log(date.valueOf());
    var ipAddr = getIp(req);
    var newIP = ipAddr + ":" + date.valueOf();
    User.update({id: {$in: ipAddr}}, {$set: {id: newIP}}, {multi: true})
    res.redirect('./')
});

router.post('*', function (req, res, next){
    console.log("Wildcard Post Ran")
    res.redirect('./');
})



module.exports = router;

