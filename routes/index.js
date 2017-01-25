var express = require('express');
var url = require('url');

module.exports = function(Trial) {

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
    console.log(req.body.trial_id);
    Trial.findOne({email: JSON.parse(req.body.trial_id)}).
        exec(function(err, trial){
          trial.update({
            song_title: JSON.parse(req.body.title),
            distraction_log: JSON.parse(req.body.distractionLog),
            pleasantness_log: JSON.parse(req.body.pleasantnessLog)
          }, function(){
            console.log("test data updated successfully!");
          });
    });
  });

  /*
   * Create a new trial object and store questionnaire data.
   * Test data will be stored later.
   */
  router.post('/questions', function(req, res, next){
    var data = req.body;
    console.log(data);

    var musicPreferences = [];

    for (var key in data) {
      if (data[key] == 'on' && data.hasOwnProperty(key))
        musicPreferences.push(key);
    }

    console.log(musicPreferences);

    var trial = new Trial({
      email: data.email,
      questions: {
        gender: data.gender,
        age: data.birthYear,
        race: data.ethnicity,
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

    trial.save(function(err, trial){
      if (err)
        console.log("something went wrong here.");
      else {
        console.log("new trial created successfully!");
        res.redirect('/test');
      }
    });
  });

  return router;
};


