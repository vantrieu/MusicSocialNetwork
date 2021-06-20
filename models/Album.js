const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const albumSchema = mongoose.Schema({
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
    singers: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Singer'
    }],
    description: {
        type: String
    },
    total: {
        type: Number,
        default: 0
    },
    users: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User'
    }]
});

albumSchema.plugin(mongoosePaginate);
albumSchema.set('timestamps', true);
module.exports = mongoose.model('Album', albumSchema)