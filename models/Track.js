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
    tracktype: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'TrackType'
    },
    singer: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Singer'
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

// trackSchema.pre('deleteOne', async function (next) {
//     const track = this;
    
//     next()
// })

trackSchema.set('timestamps', true);
trackSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Track', trackSchema)