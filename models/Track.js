const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const trackSchema = mongoose.Schema({
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
    tracktype_id: {
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
trackSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Track', trackSchema)