const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        trim: true
    },
    lastname: {
        type: String,
        required: true,
        trim: true
    },
    namenosign: {
        type: String
    },
    birthday: {
        type: Date,
        //required: true,
    },
    avatar: {
        type: String,
        default: ''
    },
    gender: {
        type: String,
        //required: true,
        enum : ['Nam','Nữ', 'Không muốn tiết lộ'],
        default: 'Không muốn tiết lộ'
    },
    fbid: {
        type: String
    },
    ggid: {
        type: String
    },
    playlists: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Playlist'
    }],
    albums: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Album'
    }],
    tracks: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Track'
    }]
})

userSchema.set('timestamps', true);
module.exports = mongoose.model('User', userSchema)