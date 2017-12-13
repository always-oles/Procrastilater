var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
    token: {
        type: String,
        index: { unique: true }
    },
    name: String,
    achievements: Object,
    stats: Object,
    lastUpdate: {
        type: Date,
        default: Date.now
    },
    deleted: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('User', UserSchema);