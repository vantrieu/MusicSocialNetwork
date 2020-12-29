const jwt = require('jsonwebtoken');
const Account = require('../models/Account');
const responsehandler = require('../helpers/respone-handler');

const authModer = async (req, res, next) => {
    try {
        //const token = req.header('Authorization').replace('Bearer ', '');
        const token = req.headers['x-access-token'];
        const data = jwt.verify(token, process.env.JWT_KEY)
        const account = await Account.findOne({ _id: data._id});
        if (!account) {
            throw new Error()
        }
        const date = Math.floor(Date.now() / 1000);
        if ((data.role === 'Administrator' || data.role === 'Moderator') && data.expireIn >= date) {
            res.locals.account = account;
            next();
        }
    } catch (err) {
        const message = 'Not authorized to access this resource';
        return responsehandler(res, 200, message, null, null);
    }
}
module.exports = authModer;