const mongoose = require('mongoose')

const replySchema = mongoose.Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        trim: true
    },
    comment: {
        type: String,
        required: true
    },
    comment_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Comment'
    }
})
replySchema.set('timestamps', true);
module.exports = mongoose.model('Reply', replySchema)