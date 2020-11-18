const mongoose = require('mongoose')

const followSchema = mongoose.Schema({
    follow_id: {
        type: String,
        required: true,
        trim: true
    },
    user_id: {
        type: String,
        required: true,
        trim: true
    }
})
followSchema.set('timestamps', true);
module.exports = mongoose.model('Follow', followSchema)