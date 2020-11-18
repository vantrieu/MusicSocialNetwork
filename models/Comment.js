const mongoose = require('mongoose')

const commentSchema = mongoose.Schema({
    track_id: {
        type: String,
        required: true,
        trim: true
    },
    user_id: {
        type: String,
        required: true,
        trim: true
    },
    comment: {
        type: String,
        required: true
    },
    reply_ids: {
        type: [String],
        default: []
    }
})
commentSchema.set('timestamps', true);
module.exports = mongoose.model('Follow', commentSchema)