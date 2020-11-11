const Account = require('../models/Account');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

exports.createuser = function (req, res) {
    try {
        const account = new Account(req.body);
        Account.find({ $or: [{ username: account.username }, { email: account.email }] },
            function (err, docs) {
                if (!err) {
                    if (isEmpty(docs)) {
                        account.save();
                        res.status(201).send({
                            message: 'Account created!'
                        })
                    } else {
                        return res.status(500).json({
                            message: 'username hoặc email đã tồn tại'
                        });
                    }
                }
            }
        );
    } catch (err) {
        next(err);
    }
}

exports.createmoderator = async function (req, res, next) {
    try {
        const account = new Account(req.body);
        Account.find({ $or: [{ username: account.username }, { email: account.email }] },
            function (err, docs) {
                if (!err) {
                    if (isEmpty(docs)) {
                        account.role = 'Moderator';
                        account.save();
                        res.status(201).send({
                            message: 'Account created!'
                        })
                    } else {
                        return res.status(500).json({
                            message: 'username hoặc email đã tồn tại'
                        });
                    }
                }
            }
        );
    } catch (err) {
        next(err);
    }
}

exports.login = async function (req, res, next) {
    try {
        const pass = req.body.password;
        const username = req.body.username;
        const account = await Account.findOne({ username });
        if (account == null) {
            res.status(200).send({ message: 'Invalid login credentials' });
        }
        const isPasswordMatch = await bcrypt.compare(pass, account.password)
        if (!isPasswordMatch) {
            res.status(200).send({ message: 'Invalid login credentials' });
        }
        if (!account) {
            return res.status(401).send({
                error: 'Login failed! Check authentication credentials'
            })
        }
        const date = new Date().getTime();
        const expireAccessToken = date +  process.env.JWT_TOKEN_EXPIRATION;
        const expireRefreshToken = date +  process.env.JWT_REFRESHTOKEN_EXPIRATION;
        const accessToken = jwt.sign({ _id: account._id, role: account.role, expireIn: expireAccessToken }, process.env.JWT_KEY);
        const refreshToken = jwt.sign({ _id: account._id, role: account.role, expireIn: expireRefreshToken }, process.env.JWT_KEY);
        res.send({
            'user_id': account._doc.username,
            'x-access-token': accessToken,
            'expireIn': expireAccessToken,
            'x-refresh-token': refreshToken
        });
    } catch (err) {
        next(err);
    }
}

exports.refreshtoken = function (req, res, next) {
    try {
        const account = res.locals.account;
        const date = new Date().getTime();
        const expireAccessToken = date +  process.env.JWT_TOKEN_EXPIRATION;
        const expireRefreshToken = date +  process.env.JWT_REFRESHTOKEN_EXPIRATION;
        const accessToken = jwt.sign({ _id: account._id, role: account.role, expireIn: expireAccessToken }, process.env.JWT_KEY);
        const refreshToken = jwt.sign({ _id: account._id, role: account.role, expireIn: expireRefreshToken }, process.env.JWT_KEY);
        res.send({
            'user_id': account.username,
            'x-access-token': accessToken,
            'expireIn': expireAccessToken,
            'x-refresh-token': refreshToken
        });
    } catch(err) {
        next(err);
    }
}