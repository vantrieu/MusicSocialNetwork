const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const accountSchema = mongoose.Schema({
    user_id: {
        type: String,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minLength: 8
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: value => {
            if (!validator.isEmail(value)) {
                throw new Error({ error: 'Invalid Email address' })
            }
        }
    },
    isBlock: {
        type: Number,
        required: true,
        enum : [1, 0],
        default: 0
    },
    role: {
        type: String,
        required: true,
        default: 'User'
    },
    createdate: {
        type: Date,
        required: true,
        default: Date.now()
    },
    resetPasswordToken: String
})

accountSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

accountSchema.methods.generateAuthToken = async function () {
    const account = this
    const token = jwt.sign({ _id: account._id, role: account.role }, process.env.JWT_KEY)
    return token
}

module.exports = mongoose.model('Account', accountSchema)