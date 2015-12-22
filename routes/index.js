var express = require('express');
var vars = require('../config/vars.json');
var querystring = require('querystring');
var https = require('https');
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
    db.collection('heroes').find().toArray(function (error, result){
        //sort the heroes array based on their vote count totals
        result.sort( heroVoteSort );
        res.render('standing', {heroes: result});
    });
    //1. get ALL items
    //2. Sort them by highest likes
    //3. res.resnder the standings view and pass it the sorted photo array
});

function heroVoteSort(heroA, heroB){ 
    if(heroA.totalVotes != null && heroB.totalVotes != null){
        if(heroA.totalVotes == heroB.totalVotes){
            if(heroA.name < heroB.name){
                return -1;
            }
            else if(heroB.name < heroA.name){
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
    else if(heroA.totalVotes != null){
        return 1;
    }
    else if(heroB.totalVotes != null){
        return 1;
    }
    else{
        if(heroA.name < heroB.name){
            return -1;
        }
        else if(heroB.name < heroA.name){
            return 1;
        }
        else{
            return 0;
        }
    }
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
            if(voteVal == "buff"){
                changeObj["totalVotes"] = 1;
            }else if(voteVal == "nerf"){
                changeObj["totalVotes"] = -1;
            }else{
                changeObj["totalVotes"] = 0;
            }
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

//Code to retrieve updated heroes list

function performRequest(endpoint, method, data, success){
  endpoint += '?' + querystring.stringify(data)
  var steamAPI = 'https://api.steampowered.com/'
  console.log('about to make request')
  var req = https.get(steamAPI+endpoint, function (res){
    res.on('data', function (data){
        dataJSON = JSON.parse(data)
        heroesArray = dataJSON.result.heroes;
        heroesArray.map( function (hero){
            // console.log(hero);
            // console.log('Name: ' + hero.name);
            // console.log('ID: ' + hero.id);
            // console.log('Readable Name: ' + hero.localized_name);
            imageName = hero.name.substr(14,hero.name.length-1);
            // console.log(imageName)
            hero.image = 'http://cdn.dota2.com/apps/dota2/images/heroes/' + imageName + '_'
            console.log(hero.image + 'vert.jpg')
            
        });
    });
  });
}



router.get('/update', function (req, res, next){
    var heroEndpoint = "IEconDOTA2_570/GetHeroes/v0001/"
    performRequest(heroEndpoint, 'GET', {key: vars.apiKey, language: 'en_us'})
    res.redirect('/');
});


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

