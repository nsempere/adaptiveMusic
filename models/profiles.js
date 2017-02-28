/**
 * Created by nicksempere on 11/28/16.
 */
var mongoose = require('mongoose');

/* times are stored in milliseconds. */
var profileSchema = mongoose.Schema({
    id: String,
    sound_check_passed: Boolean,
    gender: String,
    yob: String,
    race: String,
    country: String,
    headphones: String,
    alone: String,
    noise_level: Number,
    music_habits: {
        office: String,
        home: String,
        public: String,
        library: String
    },
    music_preferences: [String]
});

module.exports = mongoose.model('Profile', profileSchema, 'profiles');
