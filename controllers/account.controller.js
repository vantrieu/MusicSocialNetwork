const Account = require('../models/Account');
const nodemailer = require('nodemailer');
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
        const date = Math.floor(Date.now() / 1000);
        const expireAccessToken = date +  parseInt(process.env.JWT_TOKEN_EXPIRATION);
        const expireRefreshToken = date +  parseInt(process.env.JWT_REFRESHTOKEN_EXPIRATION);
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
        const accessToken = jwt.sign({ _id: account._id, role: account.role, expireIn: expireAccessToken }, process.env.JWT_KEY);
        res.send({
            'user_id': account.username,
            'x-access-token': accessToken,
            'expireIn': expireAccessToken
        });
    } catch(err) {
        next(err);
    }
}

exports.fortgotpassword = async function (req, res, next) {
    try {
        const email = req.body.email;
        const account = await Account.findOne({ email: email });
        if (!account) {
            res.status('200').send({
                message: 'Vui lòng kiểm tra mail để tiếp tục quá trình quên mật khẩu!'
            });
        };
        const date = Math.floor(Date.now() / 1000);
        const expireAccessToken = date +  300;
        const tokenForgot = jwt.sign({ _id: account._id, expireIn:  expireAccessToken}, process.env.JWT_KEY)
        account.resetPasswordToken = tokenForgot;
        account.save();
        var transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.ACCOUNT_GMAIL,
                pass: process.env.PASSWORD_GMAIL
            }
        });
        var mainOptions = {
            from: 'music.social.network.developer@gmail.com',
            to: account.email,
            subject: 'Reset Password',
            text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://localhost:3000/accounts/reset/' + account.resetPasswordToken + '\n\n' +
                'Note: The link is valid for 5 minutes. \n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        }
        transporter.sendMail(mainOptions, function (err, info) {
            if (err) {
                console.log(err)
                return res.status(500).json({
                    message: 'Internal Server Error'
                });
            } else {
                console.log(info);
                return res.status(200).json({
                    message: 'Vui lòng kiểm tra mail để tiếp tục quá trình quên mật khẩu!'
                });
            }
        });
    } catch (err) {
        next(err);
    }
}

exports.resetpassword = function (req, res, next) {
    try {
        const account =  res.locals.account;
        if(!account){
            res.status(400).send({
                message: 'Bad request!'
            });
        }
        const newpass = req.body.password;
        account.password = newpass;
        account.resetPasswordToken = '';
        account.save();
        res.status(200).send({
            message: 'Reset password success!'
        });
    } catch (err) {
        next(err);
    }
}

exports.changepassword = function (req, res, next) {
    const account = res.locals.account;
    const password = req.body.password;
    account.password = password;
    account.save();
    res.status(200).json({
        message: 'Change password success!'
    });
}