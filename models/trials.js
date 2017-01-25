/**
 * Created by nicksempere on 11/28/16.
 */
var mongoose = require('mongoose');

/* times are stored in milliseconds. */
var trialSchema = mongoose.Schema({
    email: String,
    questions: {
        gender: String,
        age: String,
        race: String,
        headphones: String,
        alone: String,
        noise_level: Number,
        musicHabits: {
            office: String,
            home: String,
            public: String,
            library: String
        }
    },
    song_title: String,
    distraction_log: [{val: Number, time: Number}],
    pleasantness_log: [{val: Number, time: Number}]
});

module.exports = mongoose.model('Trial', trialSchema);
