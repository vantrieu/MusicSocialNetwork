const mongoose = require('mongoose');
const Reply = require('./Reply');

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

commentSchema.pre('deleteOne', async function (next) {
    const comment = this._conditions;
    //delete reply of comment
    let replies = await Reply.find({ comment_id: comment._id});
    replies.forEach(async element => {
        await Reply.deleteOne(element);
    })
    next()
})
commentSchema.set('timestamps', true);
module.exports = mongoose.model('Comment', commentSchema)