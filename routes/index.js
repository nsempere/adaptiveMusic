var express = require('express');

module.exports = function(Trial) {

  var router = express.Router();

  /* GET home page. */
  router.get('/', function (req, res, next) {
    res.sendFile('adaptiveMusic.html', {'root': 'views'});
  });

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

  });

  router.post('/results', function (req, res, next) {
    console.log(req.body);
  });
  return router;
};


