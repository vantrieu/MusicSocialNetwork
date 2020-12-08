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
    tracklink: {
        type: String,
        default: ''
    },
    trackname: {
        type: String,
        required: true
    },
    namenosign: {
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
    album_id: {
        type: mongoose.SchemaTypes.ObjectId
    },
    comments: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Comment'
    }],
    playlists: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Playlist'
    }]
})

trackSchema.set('timestamps', true);
module.exports = mongoose.model('Track', trackSchema)