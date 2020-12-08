const mongoose = require('mongoose')

const albumSchema = mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        trim: true
    },
    albumname: {
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
    tracks: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Track'
    }],
    description: {
        type: String
    },
    total: {
        type: Number,
        default: 0
    }
});

albumSchema.set('timestamps', true);
module.exports = mongoose.model('Album', albumSchema)