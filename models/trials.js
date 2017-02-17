/**
 * Created by nicksempere on 1/26/17.
 */
var mongoose = require('mongoose');

/* times are stored in milliseconds. */
var trialSchema = mongoose.Schema({
    profile_id: String,
    song_title: String,
    accuracy: Number,
    avg_response_time: Number,
    distraction_log: [{val: Number, time: Number}],
    pleasantness_log: [{val: Number, time: Number}]
});

module.exports = mongoose.model('Trial', trialSchema, 'trials');
