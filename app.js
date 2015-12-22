var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var schedule = require('node-schedule');
var Schema = mongoose.Schema;

var routes = require('./routes/index');
var users = require('./routes/users');
var apiRoutes = require('./routes/api')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/api', apiRoutes);

var mainDbUrl = process.env.PROD_MONGODB || 'mongodb://localhost:27017/buffornerf'
var db = mongoose.createConnection(mainDbUrl);

//Code to retrieve updated heroes list

function performRequest(endpoint, method, data, success){
  endpoint += '?' + querystring.stringify(data)
  var steamAPI = 'https://api.steampowered.com/'
  console.log('about to make request')
  var req = https.get(steamAPI+endpoint, function (res){
    res.on('data', function (data){
        dataJSON = JSON.parse(data)
        heroesArray = dataJSON.result.heroes;
        console.log(heroesArray.length)
        heroesArray.map( function (hero){
            imageName = hero.name.substr(14,hero.name.length-1);
            hero.image = 'http://cdn.dota2.com/apps/dota2/images/heroes/' + imageName + '_'
            Hero.findOneAndUpdate({id: hero.id}, {localized_name: hero.localized_name, img: hero.image, id: hero.id}, {upsert: true, 'new': true}, function (error, result){
                // console.log(result);
            });
        });
    });
  });
}

schedule.scheduleJob({hour: 20, minute: 50, dayOfWeek: 2}, function(){
  var heroEndpoint = "IEconDOTA2_570/GetHeroes/v0001/"
  performRequest(heroEndpoint, 'GET', {key: steamKey, language: 'en_us'})
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
