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
    },
    received: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Message', MessageSchema);