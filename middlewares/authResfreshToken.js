const jwt = require('jsonwebtoken')
const Account = require('../models/Account')
const responsehandler = require('../helpers/respone-handler');

const authResfreshToken = async (req, res, next) => {
    try {
        //const token = req.header('Authorization').replace('Bearer ', '')
        const accessToken = req.headers['x-access-token'];
        const refreshToken = req.headers['x-refresh-token'];
        const data_access_token = jwt.verify(accessToken, process.env.JWT_KEY);
        const data_refresh_token = jwt.verify(refreshToken, process.env.JWT_KEY);
        const account = await Account.findOne({ _id: data_access_token._id })
        if (!account) {
            throw new Error()
        }
        const date = Math.floor(Date.now() / 1000);
        if (data_refresh_token.expireIn >= date && data_access_token.expireIn >= date) {
            res.locals.account = account;
            next()
        } else {
            const message = 'Not authorized to access this resource';
            return responsehandler(res, 200, message, null, null);
        }
    } catch (err) {
        const message = 'Not authorized to access this resource';
        return responsehandler(res, 200, message, null, null);
    }
}
module.exports = authResfreshToken;