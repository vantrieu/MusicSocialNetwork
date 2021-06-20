const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const playlistSchema = mongoose.Schema({
    tracks: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Track'
    }],
    playlistname: {
        type: String,
        required: true
    },
    namenosign: {
        type: String
    },
    background: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    total: {
        type: Number,
        default: 0
    },
    users: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User'
    }
});

playlistSchema.set('timestamps', true);
playlistSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Playlist', playlistSchema);