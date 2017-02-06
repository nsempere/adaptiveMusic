var express = require('express');
var url = require('url');
var crypto = require('crypto');

module.exports = function(Profile, Trial) {

  var router = express.Router();

  /* GET home page. */
  router.get('/pretest', function (req, res, next) {
    res.sendFile('questionnaire.html', {'root': 'views'});
  });

  // todo: If questionnaire is not finished, redirect to intro page
  router.get('/test', function (req, res, next) {
    res.sendFile('adaptiveMusic.html', {'root': 'views'});
  });

  router.get('/thankyou', function (req, res, next) {
    res.sendFile('thankYou.html', {'root': 'views'});
  });


  /* Post results of a trial to database */
  router.post('/results', function (req, res, next) {
    console.log(JSON.parse(req.body.profile_id));
    var trial = new Trial({
      profile_id: JSON.parse(req.body.profile_id),
      song_title: JSON.parse(req.body.title),
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
  });

  /*
   * Create a new trial object and ID, and store questionnaire data. Responds with
   * the ID of the new trial. Test data will be stored later.
   */
  router.post('/questions', function(req, res, next){
    var data = req.body;
    var musicPreferences = [], date = new Date();
    var id = crypto.createHash('sha1').update(date.valueOf().toString()).digest('hex');

    for (var key in data) {
      if (data[key] == 'on' && data.hasOwnProperty(key))
        musicPreferences.push(key);
    }

    var profile = new Profile({
      id: id,
      questions: {
        gender: data.gender,
        age: data.birthYear,
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
      }
    });

    profile.save(function(err, profile){
      if (err) {
        console.log("something went wrong here.");
        res.send(JSON.stringify({id: 'null'}));
      } else {
        console.log("new profile created successfully!");
        res.send(JSON.stringify({id: id}));
      }
    });
  });

  return router;
};


