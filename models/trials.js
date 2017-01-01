/**
 * Created by nicksempere on 11/28/16.
 */
var mongoose = require('mongoose');

var trialSchema = mongoose.Schema({
    trial_id: Number,
    song_title: String,
    distraction_levels: [Number],
    pleasantness_levels: [Number]
});

module.exports = mongoose.model('Trial', trialSchema);
