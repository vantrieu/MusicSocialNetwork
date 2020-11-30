const Account = require('../models/Account');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const moment = require('moment');
const responsehandler = require('../helpers/respone-handler');

function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

exports.login = async function (req, res, next) {
    const pass = req.body.password;
    const username = req.body.username;
    const account = await Account.findOne({ username });
    // return result if the username is not found in the database
    if (account == null) {
        const message = 'Login failed! Username or password is incorrect'
        return responsehandler(res, 200, message, null, null)
    }
    const isPasswordMatch = await bcrypt.compare(pass, account.password)
    // return result if password does not match
    if (!isPasswordMatch) {
        const message = 'Login failed! Username or password is incorrect'
        return responsehandler(res, 200, message, null, null)
    }
    // return result if the account is locked
    if (account.islock === 1) {
        const mesage = 'Login failed! The account is locked'
        return responsehandler(res, 200, message, null, null)
    }
    const date = Math.floor(Date.now() / 1000);
    const expireAccessToken = date + parseInt(process.env.JWT_TOKEN_EXPIRATION);
    const expireRefreshToken = date + parseInt(process.env.JWT_REFRESHTOKEN_EXPIRATION);
    const accessToken = jwt.sign({ _id: account._id, role: account.role, expireIn: expireAccessToken }, process.env.JWT_KEY);
    const refreshToken = jwt.sign({ _id: account._id, role: account.role, expireIn: expireRefreshToken }, process.env.JWT_KEY);
    const message = 'Successfully';
    const data = {
        'expireIn': expireAccessToken,
        'role': account.role,
        'x-access-token': accessToken,
        'x-refresh-token': refreshToken
    };
    return responsehandler(res, 200, message, data, null)
}

exports.refreshtoken = function (req, res, next) {
    try {
        const account = res.locals.account;
        const date = Math.floor(Date.now() / 1000);
        const expireAccessToken = date + parseInt(process.env.JWT_TOKEN_EXPIRATION);
        const expireRefreshToken = date + parseInt(process.env.JWT_REFRESHTOKEN_EXPIRATION);
        const accessToken = jwt.sign({ _id: account._id, role: account.role, expireIn: expireAccessToken }, process.env.JWT_KEY);
        const refreshToken = jwt.sign({ _id: account._id, role: account.role, expireIn: expireRefreshToken }, process.env.JWT_KEY);
        return res.send({
            'expireIn': expireAccessToken,
            'role': account.role,
            'x-access-token': accessToken,
            'x-refresh-token': refreshToken
        });
    } catch (err) {
        next(err);
    }
}

exports.fortgotpassword = async function (req, res, next) {
    Account.findOne({ email: req.body.email })
        .then((account) => {
            if (!account) {
                return res.status('200').send({
                    message: 'Vui lòng kiểm tra mail để Please check your email to continue the process of forgetting your password! tục quá trình quên mật khẩu!'
                });
            };
            const date = Math.floor(Date.now() / 1000);
            const expireAccessToken = date + 300;
            const tokenForgot = jwt.sign({ _id: account._id, expireIn: expireAccessToken }, process.env.JWT_KEY)
            account.resetPasswordToken = tokenForgot;
            account.save()
                .then(() => {
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
                            return res.status(500).json({
                                message: 'Internal Server Error'
                            });
                        } else {
                            return res.status(200).json({
                                message: 'Please check your email to continue the process of forgetting your password!'
                            });
                        }
                    });
                })
                .catch(err => next(err));
        })
        .catch(err => next(err));
}

exports.resetpassword = function (req, res, next) {
    const account = res.locals.account;
    if (!account) {
        return res.status(400).send({
            message: 'Bad request!'
        });
    }
    account.password = req.body.password;
    account.resetPasswordToken = '';
    account.save()
        .then(() => {
            return res.status(200).send({
                message: 'Reset password success!'
            });
        })
        .catch(err => next(err))
}

exports.changepassword = function (req, res, next) {
    const account = res.locals.account;
    account.password = req.body.password;
    account.save()
        .then(() => {
            return res.status(200).json({
                message: 'Change password success!'
            });
        })
        .catch(err => next(err));

}

exports.registeraccount = function (req, res, next) {
    try {
        let account = new Account();
        let user = new User();
        Account.find({ $or: [{ username: req.value.body.username }, { email: req.value.body.email }] },
            function (err, docs) {
                if (!err) {
                    if (isEmpty(docs)) {
                        account.username = req.value.body.username;
                        account.password = req.value.body.password;
                        account.email = req.value.body.email;
                        account.user_id = user._id;
                        account.phonenumber = req.value.body.phonenumber;
                        account.save()
                            .then(() => {
                                user.firstname = req.value.body.firstname;
                                user.lastname = req.value.body.lastname;
                                user.birthday = req.value.body.birthday;
                                user.gender = req.value.body.gender;
                                user.save().then(() => {
                                    return res.status(201).json({
                                        message: 'Account created!'
                                    })
                                }).catch(err => {
                                    account.deleteOne({ _id: account._id });
                                    next(err);
                                });

                            })
                            .catch(err => next(err));
                    } else {
                        return res.status(200).json({
                            message: 'Username or email already exists!'
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
                        account.phonenumber = req.body.phonenumber;
                        account.save()
                            .then(() => {
                                user.firstname = req.body.firstname;
                                user.lastname = req.body.lastname;
                                user.birthday = req.body.birthday;
                                user.gender = req.body.gender;
                                user.save().then(() => {
                                    return res.status(201).json({
                                        message: 'Account created!'
                                    })
                                }).catch(err => {
                                    account.deleteOne({ _id: account._id });
                                    next(err);
                                })
                            }).catch(err => next(err));

                    } else {
                        return res.res.status(500).json({
                            message: 'Username or email already exists!'
                        });
                    }
                }
            }
        );

    } catch (err) {
        next(err);
    }
}

exports.getlistaccountactive = async function (req, res, next) {
    try {
        const account = await Account.find({ islock: 0 });
        var temp = [];
        account.forEach(function (item) {
            item._doc.createdate = moment(item._doc.createdate).format('DD/MM/YYYY');
            const { __v, password, user_id, role, createdAt, updatedAt, ...accNoField } = item._doc;
            temp.push(accNoField);
        });
        return res.send(temp);
    } catch (err) {
        next(err);
    }
}

exports.getlistmoderatoractive = async function (req, res, next) {
    try {
        const account = await Account.find({ role: 'Moderator', islock: 0 });
        var temp = [];
        account.forEach(function (item) {
            item._doc.createdate = moment(item._doc.createdate).format('DD/MM/YYYY');
            const { __v, password, user_id, role, createdAt, updatedAt, ...accNoField } = item._doc;
            temp.push(accNoField);
        });
        return res.send(temp);
    } catch (err) {
        next(err);
    }
}

exports.getlistaccountlock = async function (req, res, next) {
    try {
        const account = await Account.find({ islock: 1 });
        var temp = [];
        account.forEach(function (item) {
            item._doc.createdate = moment(item._doc.createdate).format('DD/MM/YYYY');
            const { __v, password, user_id, role, createdAt, updatedAt, ...accNoField } = item._doc;
            temp.push(accNoField);
        });
        return res.send(temp);
    } catch (err) {
        next(err);
    }
}

exports.getlistmoderatorlock = async function (req, res, next) {
    try {
        const account = await Account.find({ role: 'Moderator', islock: 1 });
        var temp = [];
        account.forEach(function (item) {
            item._doc.createdate = moment(item._doc.createdate).format('DD/MM/YYYY');
            const { __v, password, user_id, role, createdAt, updatedAt, ...accNoField } = item._doc;
            temp.push(accNoField);
        });
        return res.send(temp);
    } catch (err) {
        next(err);
    }
}

exports.lockaccount = function (req, res, next) {
    try {
        let user_id = req.body.id;
        Account.findOne({ _id: user_id }, function (err, account) {
            if (err)
                next(err);
            else {
                account.islock = 1;
                account.save();
                return res.status(200).json({
                    message: 'Account lock is successful'
                })
            }
        });
    } catch (err) {
        next(err);
    }
}

exports.unlockaccount = function (req, res, next) {
    try {
        let user_id = req.body.id;
        Account.findOne({ _id: user_id }, function (err, account) {
            if (err)
                next(err);
            else {
                account.islock = 0;
                account.save();
                return res.status(200).json({
                    message: 'Account unlock is successful'
                })
            }
        });
    } catch (err) {
        next(err);
    }
}