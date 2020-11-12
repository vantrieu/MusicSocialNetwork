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
    birthday: {
        type: Date,
        required: true,
    },
    avatar: {
        type: String,
        default: ''
    },
    gender: {
        type: String,
        required: true,
        enum : ['Nam','Nữ', 'Không muốn tiết lộ'],
        default: 'Không muốn tiết lộ'
    }
})

module.exports = mongoose.model('User', userSchema)