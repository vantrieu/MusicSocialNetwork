const mongoose = require('mongoose')

const commentSchema = mongoose.Schema({
    track_id: {
        type: mongoose.SchemaTypes.ObjectId,
        trim: true
    },
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    replys: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Reply'
    }]
})
commentSchema.set('timestamps', true);
module.exports = mongoose.model('Comment', commentSchema)