const Account = require('../models/Account');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const moment = require('moment');

function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
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
        const expireAccessToken = date + parseInt(process.env.JWT_TOKEN_EXPIRATION);
        const expireRefreshToken = date + parseInt(process.env.JWT_REFRESHTOKEN_EXPIRATION);
        const accessToken = jwt.sign({ _id: account._id, role: account.role, expireIn: expireAccessToken }, process.env.JWT_KEY);
        const refreshToken = jwt.sign({ _id: account._id, role: account.role, expireIn: expireRefreshToken }, process.env.JWT_KEY);
        res.send({
            'user_id': account._doc.user_id,
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
        const expireAccessToken = date + process.env.JWT_TOKEN_EXPIRATION;
        const accessToken = jwt.sign({ _id: account._id, role: account.role, expireIn: expireAccessToken }, process.env.JWT_KEY);
        res.send({
            'user_id': account.username,
            'x-access-token': accessToken,
            'expireIn': expireAccessToken
        });
    } catch (err) {
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
        const expireAccessToken = date + 300;
        const tokenForgot = jwt.sign({ _id: account._id, expireIn: expireAccessToken }, process.env.JWT_KEY)
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
        const account = res.locals.account;
        if (!account) {
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

    try {
        const account = res.locals.account;
        const password = req.body.password;
        account.password = password;
        account.save();
        res.status(200).json({
            message: 'Change password success!'
        });
    } catch (err) {
        next()
    }
}

exports.registeraccount = function (req, res, next) {
    try {
        let account = new Account();
        let user = new User();
        Account.find({ $or: [{ username: req.body.username }, { email: req.body.email }] },
            function (err, docs) {
                if (!err) {
                    if (isEmpty(docs)) {
                        account.username = req.body.username;
                        account.password = req.body.password;
                        account.email = req.body.email;
                        account.user_id = user._id;
                        account.save();
                        user.firstname = req.body.firstname;
                        user.lastname = req.body.lastname;
                        user.birthday = req.body.birthday;
                        user.gender = req.body.gender;
                        user.save();
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

exports.registermoderator = function (req, res, next) {
    try {
        let account = new Account();
        let user = new User();
        Account.find({ $or: [{ username: req.body.username }, { email: req.body.email }] },
            function (err, docs) {
                if (!err) {
                    if (isEmpty(docs)) {
                        account.username = req.body.username;
                        account.password = req.body.password;
                        account.email = req.body.email;
                        account.user_id = user._id;
                        account.role = 'Moderator';
                        account.save();
                        user.firstname = req.body.firstname;
                        user.lastname = req.body.lastname;
                        user.birthday = req.body.birthday;
                        user.gender = req.body.gender;
                        user.save();
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

exports.getlistaccount = async function (req, res, next) {
    try {
        const account = await Account.find();
        var temp = [];
        account.forEach(function(item){
            item._doc.createdate = moment(item._doc.createdate).format('DD/MM/YYYY');
            const {__v, password, user_id, role, ...accNoField } = item._doc;
            temp.push(accNoField); 
        });
        res.send(temp);
    } catch (err) {
        next(err);
    }
}

exports.getlistmoderator = async function (req, res, next) {
    try {
        const account = await Account.find({role: 'Moderator'});
        var temp = [];
        account.forEach(function(item){
            item._doc.createdate = moment(item._doc.createdate).format('DD/MM/YYYY');
            const {__v, password, user_id, role, ...accNoField } = item._doc;
            temp.push(accNoField); 
        });
        res.send(temp);
    } catch (err) {
        next(err);
    }
}