var express = require('express');
var url = require('url');
var crypto = require('crypto');

module.exports = function(Profile, Trial) {

  var router = express.Router();

  /* GET home page. */
  router.get('/', function (req, res, next) {
    var date = new Date();
    var id = crypto.createHash('sha1').update(date.valueOf().toString()).digest('hex');
    res.cookie('profile_id', id, { maxAge: 900000, httpOnly: true });
    res.sendFile('consent.html', {'root': 'views'});
  });

  router.get('/pretest', function (req, res, next) {
    res.sendFile('questionnaire.html', {'root': 'views'});
  });

  router.get('/test', function (req, res, next) {
    res.sendFile('adaptiveMusic.html', {'root': 'views'});
  });

  router.get('/thankyou', function (req, res, next) {
    res.sendFile('thankYou.html', {'root': 'views'});
  });

  /*
   * Create a new trial object and ID, and store questionnaire data. ID is
   * set as a cookie. Test data will be stored later.
   */
  router.post('/questions', function(req, res, next){
    var data = req.body;
    var musicPreferences = [];

    if (req.cookies.profile_id === undefined){
      res.status(400).send('Request needs a profile ID');
    }

    for (var key in data) {
      if (data[key] == 'on' && data.hasOwnProperty(key))
        musicPreferences.push(key);
    }

    var profile = new Profile({
      id: req.cookies.profile_id,
      gender: data.gender,
      yob: data.birthYear,
      race: data.ethnicity,
      country: data.countryCode,
      headphones: data.headphones,
      alone: data.alone,
      noise_level: data.noiseLevel,
      music_habits: {
        office: data.q1,
        home: data.q2,
        public: data.q3,
        library: data.q4
      },
      music_preferences: musicPreferences
    });

    profile.save(function(err, profile){
      if (err) {
        console.log("something went wrong here.");
        res.status(500).end();
      } else {
        console.log("new profile created successfully!");
        res.send(profile);
      }
    });
  });


  /* Post results of a trial to database */
  router.post('/results', function (req, res, next) {
    if (req.cookies.profile_id === undefined){
      res.status(400).send('Request needs a profile ID');
    }
    else {
      var profile_id = req.cookies.profile_id;
      var trial = new Trial({
        profile_id: profile_id,
        song_title: req.body.title,
        accuracy: req.body.accuracy,
        avg_response_time: req.body.avgResponseTime,
        distraction_log: JSON.parse(req.body.distractionLog),
        pleasantness_log: JSON.parse(req.body.pleasantnessLog)
      });

      trial.save(function(err, trial){
        if (err)
          console.log("something went wrong here.");
        else {
          console.log("new trial created successfully!");
        }
      });
    }
  });

  return router;
};


