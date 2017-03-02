/**
 * Created by nicksempere on 1/26/17.
 */
var mongoose = require('mongoose');

/* times are stored in milliseconds. */
var trialSchema = mongoose.Schema({
    profile_id: String,
    trial_id: String,
    song_title: String,
    n_back_task: Number,
    accuracy: Number,
    avg_response_time: Number,
    distraction_log: [{val: Number, time: Number}],
    pleasantness_log: [{val: Number, time: Number}]
});

module.exports = mongoose.model('Trial', trialSchema, 'trials');
