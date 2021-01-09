const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

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
    islock: {
        type: Number,
        required: true,
        enum : [1, 0],
        default: 0
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
userSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('User', userSchema)