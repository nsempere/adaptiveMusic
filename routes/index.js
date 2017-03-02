var express = require('express');
var url = require('url');
var crypto = require('crypto');

module.exports = function(AWS) {

  var router = express.Router();
  var documentClient = new AWS.DynamoDB.DocumentClient();

  /* GET home page. */
  router.get('/', function (req, res, next) {
    var date = new Date();
    var id = crypto.createHash('sha1').update(date.valueOf().toString()).digest('hex');
    res.cookie('profile_id', id, { maxAge: 900000, httpOnly: true });
    res.sendFile('consent.html', {'root': 'views'});
  });


  router.get('/audio', function (req, res, next) {
    res.sendFile('audio.html', {'root': 'views'});
  });


  router.get('/pretest', function (req, res, next) {
    res.sendFile('questionnaire.html', {'root': 'views'});
  });


  router.get('/instructions', function (req, res, next) {
    res.sendFile('instructions.html', {'root': 'views'});
  });


  /*
   * Provide the test page. If this is the user's first round, set trial number as a cookie.
   * If it is the user's fourth test, redirect to the end of the experiment. Otherwise, increment
   * the test number and continue.
   */
  router.get('/test', function (req, res, next) {
    if (req.cookies.trial === undefined) {
      res.cookie('trial', 1, { maxAge: 900000, httpOnly: false });
      res.sendFile('adaptiveMusic.html', {'root': 'views'});
    } else if (parseInt(req.cookies.trial) == 4){
      res.redirect('/thankyou');
    } else {
      res.cookie('trial', parseInt(req.cookies.trial) + 1, { maxAge: 900000, httpOnly: false });
      res.sendFile('adaptiveMusic.html', {'root': 'views'});
    }

  });


  router.get('/thankyou', function (req, res, next) {
    res.sendFile('thankYou.html', {'root': 'views'});
  });


  router.post('/confirmConsent', function(req, res, next){
    res.cookie('consent_confirmed', true, { maxAge: 900000, httpOnly: true });
    res.send("Consent established");
  });
  /*
   * Store result of the audio test as a cookie before continuing.
   */
  router.post('/soundCheck', function(req, res, next) {
    var data = req.body;
    var sound_check = (data.q1 == 'right' && data.q2 == 'both' && data.q3 == 'left');
    res.cookie('sound_check', sound_check, { maxAge: 900000, httpOnly: true });
    res.status(200).send(sound_check);
  });


  /*
   * Create a new profile object and ID, and store questionnaire data. ID is
   * set as a cookie.
   */
  router.post('/questions', function(req, res, next){
    var data = req.body;
    var musicPreferences = [];

    if (req.cookies.profile_id === undefined){
      res.status(400).send('Request needs a profile ID');
    }
    if (req.cookies.sound_check === undefined){
      res.status(400).send('Incomplete request. No sound-check results provided');
    }

    for (var key in data) {
      if (data[key] == 'on' && data.hasOwnProperty(key))
        musicPreferences.push(key);
    }

    var params = {
      TableName: 'Profiles',
      Item: {
        'id': req.cookies.profile_id,
        'sound_check_passed': req.cookies.sound_check,
        'gender': data.gender,
        'yob': data.birthYear,
        'race': data.ethnicity,
        'country': data.countryCode,
        'headphones': data.headphones,
        'alone': data.alone,
        'noise_level': data.noiseLevel,
        'music_habits': {
          'office': data.q1,
          'home': data.q2,
          'public': data.q3,
          'library': data.q4
        },
        'music_preferences': musicPreferences
      }
    };

    documentClient.put(params, function(err, data){
      if (err) {
        console.log("An error occurred while storing this profile:" + JSON.stringify(err, null, 2));
        res.status(500).send(err);
      } else {
        console.log("Success!");
        res.status(200).send(data);
      }
    });
  });


  /*
   * Post results of a trial to database. Create a new trial id and store the id
   * of the relevant profile.
   */
  router.post('/results', function (req, res, next) {
    if (req.cookies.profile_id === undefined){
      res.status(400).send('Request needs a profile ID');
    }
    else if (req.cookies.trial === undefined){
      res.status(400).send('No trial information was given');
    }

    var date = new Date();
    var trial_id = crypto.createHash('sha1').update(date.valueOf().toString()).digest('hex');
    var profile_id = req.cookies.profile_id;
    //First two test are 1-back, second two are 2-back
    var nbackTask = parseInt(req.cookies.trial) < 3 ? nbackTask = 1 : nbackTask = 2;

    var params = {
      TableName: 'Trials',
      Item: {
        'profile_id': profile_id,
        'trial_id': trial_id,
        'trial_number': req.cookies.trial,
        'song_title': req.body.title,
        'n_back_task': nbackTask,
        'accuracy': req.body.accuracy,
        'avg_response_time': req.body.avgResponseTime,
        'distraction_log': JSON.parse(req.body.distractionLog),
        'pleasantness_log': JSON.parse(req.body.pleasantnessLog)
      }
    };

    documentClient.put(params, function(err, data){
      if (err) {
        console.log("An error occurred while storing this trial:" + JSON.stringify(err, null, 2));
        res.status(500).send(err);
      } else {
        console.log("Success!");
        res.status(200).send(data);
      }
    });
  });

  return router;
};


