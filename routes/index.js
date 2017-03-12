var express = require('express');
var url = require('url');
var crypto = require('crypto');

module.exports = function(AWS, logger) {

  var router = express.Router();
  var documentClient = new AWS.DynamoDB.DocumentClient();

  /* GET home page. */
  router.get('/', function (req, res, next) {
    var date = (new Date()).valueOf().toString();
    var id = crypto.createHash('sha1').update(date).digest('hex');
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
      logger.log('verbose', 'GET /test: First trial for participant with profile ID - %s', req.cookies.profile_id);
      res.cookie('trial', 1, { maxAge: 900000, httpOnly: false });
      res.sendFile('adaptiveMusic.html', {'root': 'views'});
    } else if (parseInt(req.cookies.trial) == 4){
      logger.log('verbose', 'GET /test: Participant with profile ID - %s finished last test', req.cookies.profile_id);
      res.redirect('/thankyou');
    } else {
      var nextTrial = parseInt(req.cookies.trial) + 1;
      logger.log('verbose', 'GET /test: Participant with profile ID - %s on test %n', req.cookies.profile_id, nextTrial);
      res.cookie('trial', nextTrial, { maxAge: 900000, httpOnly: false });
      res.sendFile('adaptiveMusic.html', {'root': 'views'});
    }

  });


  router.get('/thankyou', function (req, res, next) {
    res.sendFile('thankYou.html', {'root': 'views'});
  });


  router.post('/confirmConsent', function(req, res, next){
    logger.log('verbose', 'POST /confirmConsent: Participant with profile ID - %s has consented to continue');
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
      logger.log('error', 'POST /questions: No profile ID was given');
      res.status(400).send('Request needs a profile ID');
    }
    if (req.cookies.sound_check === undefined){
      logger.log('error', 'POST /questions: Participant with ID - %s has no sound_check results');
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
        logger.log('error', 'POST /questions: An error occurred while adding entry to table "Profiles": ' + err);
        res.status(500).send(err);
      } else {
        logger.log('info', 'POST /questions: New entry to table "Profiles": ' + params.Item);
        res.status(200).send(params.Item);
      }
    });
  });


  /*
   * Post results of a trial to database. Create a new trial id and store the id
   * of the relevant profile.
   */
  router.post('/results', function (req, res, next) {
    if (req.cookies.profile_id === undefined){
      logger.log('error', 'POST /results: No profile ID was defined');
      res.status(400).send('Request needs a profile ID');
    }
    else if (req.cookies.trial === undefined){
      logger.log('error', 'POST /results: No trial information was given');
      res.status(400).send('No trial information was given');
    }

    var date = (new Date()).valueOf().toString();
    var trial_id = crypto.createHash('sha1').update(date).digest('hex');
    //First two test are 1-back, second two are 2-back
    var nbackTask = parseInt(req.cookies.trial) < 3 ? nbackTask = 1 : nbackTask = 2;

    var params = {
      TableName: 'Trials',
      Item: {
        'profile_id': req.cookies.profile_id,
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
        logger.log('error', 'POST /results: An error occurred while creating new entry to table "Trials":', err);
        res.status(500).send(err);
      } else {
        logger.log('info', 'POST /results: new entry to table "Trials": ' + params.Item);
        res.status(200).send(data);
      }
    });
  });

  return router;
};


