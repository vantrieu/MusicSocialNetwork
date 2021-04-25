const jwt = require('jsonwebtoken')
const Account = require('../models/Account')
const responsehandler = require('../helpers/respone-handler');
const { validationResult } = require('express-validator');

const authResfreshToken = async (req, res, next) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
        return responsehandler(res, 400, err.array()[0].msg, {}, null);
    }
    const accessToken = req.headers['x-access-token'];
    const data_access_token = jwt.verify(accessToken, process.env.JWT_KEY);
    const account = await Account.findOne({ _id: data_access_token._id });
    const date = Math.floor(Date.now() / 1000);
    if (data_access_token.expireIn >= date) {
        res.locals.account = account;
        next()
    } else
    return res.status(403).json({
        error: 'Không có quyền truy cập tài nguyên này!'
    })
}

module.exports = authResfreshToken;