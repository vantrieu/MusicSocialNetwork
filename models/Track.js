const mongoose = require('mongoose')

const trackSchema = mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        trim: true
    },
    background: {
        type: String,
        required: true
    },
    trackname: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    total: {
        type: Number,
        required: true,
        default: 0
    },
    comment_ids: {
        type: [String],
        default: []
    },
    album_id: {
        type: String,
        required: true,
    },
    playlist_ids: {
        type: [String],
        default: []
    }
})

trackSchema.set('timestamps', true);
module.exports = mongoose.model('Follow', trackSchema)