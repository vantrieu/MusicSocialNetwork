const jwt = require('jsonwebtoken')
const Account = require('../models/Account')
const responsehandler = require('../helpers/respone-handler');

const authResetPass = async (req, res, next) => {
    try {
        //const token = req.header('Authorization').replace('Bearer ', '')
        const accessToken = req.params.token;
        const data = jwt.verify(accessToken, process.env.JWT_KEY)
        const account = await Account.findOne({ _id: data._id });
        if (!account) {
            throw new Error()
        }
        const date = Math.floor(Date.now() / 1000);
        if (data.expireIn >= date) {
            res.locals.account = account;
            next()
        } else {
            const message = 'Không có quyền truy cập tài nguyên này!';
            return responsehandler(res, 403, message, null, null);
        }
    } catch (err) {
        const message = 'Không có quyền truy cập tài nguyên này!';
        return responsehandler(res, 403, message, null, null);
    }
}
module.exports = authResetPass;