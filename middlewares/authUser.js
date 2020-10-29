const jwt = require('jsonwebtoken')
const User = require('../models/User')

const authUser = async(req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const data = jwt.verify(token, process.env.JWT_KEY)
        const user = await User.findOne({ _id: data._id, 'tokens.token': token })
        if (!user) {
            throw new Error()
        }
        res.locals.user = user;
        next()
    } catch (err) {
        next(err);
        res.status(401).send({ 
            message: 'Not authorized to access this resource' 
        })
    }
}
module.exports = authUser;