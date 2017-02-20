/**
 * Created by nicksempere on 11/28/16.
 */

var express = require('express');
var compression = require('compression');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');


var debugURL = 'mongodb://localhost:27017/test';
mongoose.connect(debugURL);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var Profile = require('./models/profiles');
var Trial = require('./models/trials');
var routes = require('./routes/index')(Profile, Trial);
var app = express();


app.set('views', path.join(__dirname, 'views')); //Set path for html views

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); //Set path for all assets

/*
 * Only allow users to get to test pages if they have a cookie initialized,
 * a.k.a. if they've filled out a questionnaire.
 */
app.use('*', function(req, res, next){
  console.log(req.cookies.profile_id);
  if (req.cookies.profile_id === undefined){
    if (req.originalUrl == '/' || req.originalUrl == '/questions') next();
    else res.redirect('/');
  }
  else {
    next();
  }
});

app.use('/', routes);

/*
 * If no other routes match, 404
 */
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});



/* error handlers */
/* development error handler - will print stacktrace */
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next){
    res.status(err.status || 500);
    res.send({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next){
  res.status(err.status || 500);
  res.send({
    message: err.message,
    error: err
  });
});

module.exports = app;
