var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var MessageSchema   = new Schema({
    token: {
        type: 'String',
        required: true
    },
    fromName: {
        type: 'String',
        required: true
    },
    fromEmail: 'String',
    text: {
        type: 'String',
        required: true
    }
});

module.exports = mongoose.model('Message', MessageSchema);