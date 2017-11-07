var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
    data: Object
});

module.exports = mongoose.model('User', UserSchema);