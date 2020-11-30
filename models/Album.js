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
    }
});

albumSchema.set('timestamps', true);
module.exports = mongoose.model('Album', albumSchema)