const jwt = require('jsonwebtoken')
const Account = require('../models/Account')

const getCurrentUser = async (req, res, next) => {
    try {
        const token = req.headers['x-access-token'];
        const data = jwt.verify(token, process.env.JWT_KEY)
        const account = await Account.findOne({ _id: data._id })
        if (!account) {
            res.locals.account = null;
            next();
        }
        const date = Math.floor(Date.now() / 1000);
        if (data.expireIn >= date) {
            res.locals.account = account;
            next();
        } else {
            res.locals.account = null;
            next();
        }

    } catch (err) {
        next();
    }
}
module.exports = getCurrentUser;