var express = require('express');

module.exports = function(Trial) {

  var router = express.Router();
  var files = ['Lorn']; /* todo: make this dynamic */

  /* GET home page. */
  router.get('/', function (req, res, next) {
    res.sendFile('adaptiveMusic.html', {'root': 'views'});
  });

  router.get('/thankyou', function (req, res, next) {
    res.sendFile('thankYou.html', {'root': 'views'});
  });

  /* Post results of a trial to database */
  router.post('/results', function (req, res, next) {
    var trial = new Trial({
      song_title: req.body.title,
      distraction_log: JSON.parse(req.body.distractionLog),
      pleasantness_log: JSON.parse(req.body.pleasantnessLog)
    });

    trial.save(function(err, trial){
      if (err)
        console.log("something went wrong here.");
      else
        console.log("success!");
    });
  });

  /* Request a song (randomized) */
  router.get('/song', function (req, res, next) {
    var mp3 = files[0]; /* Randomize this when more mp3 files come into play */
    res.sendFile('music/' + mp3 + '.mp3', {'root': 'public'});
  });

  return router;
};


