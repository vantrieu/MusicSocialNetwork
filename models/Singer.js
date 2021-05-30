const mongoose = require('mongoose');

const singerSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    namenosign: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    avatar: {
        type: String
    },
    tracks: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Track'
    }],
    albums: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Album'
    }]
})

singerSchema.set('timestamps', true);
module.exports = mongoose.model('Singer', singerSchema);