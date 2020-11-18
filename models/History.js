const mongoose = require('mongoose')

const historySchema = mongoose.Schema({
    track_id: {
        type: String,
        required: true
    },
    user_id: {
        type: String,
        required: true
    }
});

historySchema.set('timestamps', true);
module.exports = mongoose.model('Follow', historySchema);