const mongoose = require('mongoose');

const likeSchema = mongoose.Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    playlist: {
        type: mongoose.SchemaTypes.ObjectId
    },
    album: {
        type: mongoose.SchemaTypes.ObjectId
    },
    track: {
        type: mongoose.SchemaTypes.ObjectId
    }
})

likeSchema.set('timestamps', true);
module.exports = mongoose.model('Like', likeSchema)