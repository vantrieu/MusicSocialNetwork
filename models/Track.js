const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const TrackType = require('./TrackType');
const Singer = require('./Singer');
const Comment = require('./Comment');
const Playlist = require('./Playlist');

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
    album: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Album'
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

trackSchema.pre('deleteOne', async function (next) {
    const track = this._conditions;
    //delete track of singer
    let singer = await Singer.findById(track.singer);
    singer.tracks.pull(track._id);
    await singer.save();
    //delete track of tracktype
    let trackType = await TrackType.findById(track.tracktype);
    trackType.tracks.pull(track._id);
    await trackType.save();
    //delete comment of track
    let comments = await Comment.find({_id: { "$in" : track.comments}});
    comments.forEach(async element => {
        await Comment.deleteOne(element);
    });
    //delete track of playlist
    let playlists = await Playlist.find({_id: { "$in" : track.playlists}});
    playlists.forEach(async element => {
        element.tracks.pull(track._id);
        await element.save();
    });
    next()
})

trackSchema.set('timestamps', true);
trackSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Track', trackSchema)