const mongoose = require('mongoose')

const playlistSchema = mongoose.Schema({
    tracks: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Track'
    },
    user_id: {
        type: String,
        required: true
    },
    playlistname: {
        type: String,
        required: true
    },
    background: {
        type: String,
        required: true
    },
    description: {
        type: String
    }
});

playlistSchema.set('timestamps', true);
module.exports = mongoose.model('Playlist', playlistSchema);