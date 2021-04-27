const mongoose = require('mongoose');

const tracktypeSchema = mongoose.Schema({
    typename: {
        type: String,
        required: true,
        unique: true
    },
    isDelete: {
        type: Number,
        required: true,
        enum : [1, 0],
        default: 0
    }
})

tracktypeSchema.set('timestamps', true);
module.exports = mongoose.model('TrackType', tracktypeSchema);