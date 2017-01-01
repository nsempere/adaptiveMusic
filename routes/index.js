var express = require('express');

module.exports = function(Trial) {

  var router = express.Router();

  /* GET home page. */
  router.get('/', function (req, res, next) {
    res.sendFile('adaptiveMusic.html', {'root': 'views'});
  });

  /* For testing purposes:
  router.get('/test', function (req, res, next) {
    var trial = new Trial({song_title: "Staying Alive", trial_id: 1});
    trial.save(function(err, trial){
      if (err) return console.error(err);
      console.log(trial);
    });
    Trial.find(function(err, trials) {
      console.log("You have " + trials.length + " trials.");
      console.log(trials);
    });
    res.sendFile('test.html', {'root': 'views'});

  });*/

  /* Post results of a trial to database */
  router.post('/results', function (req, res, next) {
    //todo: prep data and save to db.
    var trial = new Trial({
      song_title: req.body.title,
      distraction_log: req.body.distractionLog,
      pleasantness_log: req.body.pleasantnessLog
    });

    trial.save(function(err, trial){
      if (err)
        console.log("something went wrong here.");
      else
        console.log("success!");
    });
  });
  return router;
};


