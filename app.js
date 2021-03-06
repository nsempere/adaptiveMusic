/**
 * Created by nicksempere on 11/28/16.
 */

var express = require('express');
var winston = require('winston');
var mini = require('express-minify');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var dotenv = require('dotenv');
var AWS = require('aws-sdk');

// Load environment variables
dotenv.load();

//Set aws configuration depending on run settings
if (process.env.MODE == 'prod') {
  console.log("Running in prod.");
  AWS.config.update({
    apiVersions: {
      dynamodb: '2012-08-10'
    },
    region: 'us-west-2',
    endpoint: "dynamodb.us-west-2.amazonaws.com"
  });
} else {
  console.log("Running in dev.");
  AWS.config.update({
    apiVersions: {
      dynamodb: '2012-08-10'
    },
    region: 'us-west-2',
    endpoint: "http://localhost:8000"
  });
}

var dynamoDb = new AWS.DynamoDB(); //.. inserted
//console.log(dynamoDb);

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({
      name: 'error-log',
      level: 'error',
      filename: 'logs/errs.log',
      timestamp: true
    }),
    new (winston.transports.File)({
      name: 'info-log',
      level: 'info',
      filename: 'logs/info.log',
      timestamp: true
    }),
    new (winston.transports.File)({
      name: 'verbose-log',
      level: 'verbose',
      filename: 'logs/info-verbose.log',
      timestamp: true
    })
  ]
});

var routes = require('./routes/index')(AWS, logger);
var app = express();

app.set('views', path.join(__dirname, 'views')); //Set path for html views

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(mini());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); //Set path for all assets


/*
 * Only allow users to get to test pages if they have a cookie initialized,
 * a.k.a. if they've consented to participate. Similarly, we only allow users to
 * proceed if they have also answered the sound check questions.
 */
app.use('*', function(req, res, next){
  var url = req.originalUrl;
  if (req.cookies.consent_confirmed === undefined){
    if (url == '/' || url == '/confirmConsent' ) next();
    else res.redirect('/');
  }
  else if (req.cookies.sound_check === undefined) {
    if (url == '/soundCheck' || url == '/audio' || url == '/confirmConsent') next();
    else res.redirect('/audio');
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
