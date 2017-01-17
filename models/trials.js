/**
 * Created by nicksempere on 11/28/16.
 */
var mongoose = require('mongoose');

/* times are stored in milliseconds. */
var trialSchema = mongoose.Schema({
    trial_id: Number,
    song_title: String,
    distraction_log: [{val: Number, time: Number}],
    pleasantness_log: [{val: Number, time: Number}]
});

module.exports = mongoose.model('Trial', trialSchema);
