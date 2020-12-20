const mongoose = require('mongoose')

const historySchema = mongoose.Schema({
    track: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: 'User'
    },
    content: {
        type: String,
        required: true
    }
});

historySchema.set('timestamps', true);
module.exports = mongoose.model('History', historySchema);