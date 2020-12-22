const Account = require('../models/Account');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const moment = require('moment');
const responsehandler = require('../helpers/respone-handler');
const removeVietnameseTones = require('../helpers/convertVie-handler');

function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

exports.login = async function (req, res) {
    const pass = req.body.password;
    const username = req.body.username;
    const account = await Account.findOne({ username });
    // return result if the username is not found in the database
    if (account == null) {
        const message = 'Đăng nhập thất bại! Tài khoản không tồn tại!'
        return responsehandler(res, 200, message, {})
    }
    const isPasswordMatch = await bcrypt.compare(pass, account.password)
    // return result if password does not match
    if (!isPasswordMatch) {
        const message = 'Đăng nhập thất bại! Tên đăng nhập hoặc mật khẩu không đúng!'
        return responsehandler(res, 200, message, {})
    }
    // return result if the account is locked
    if (account.islock === 1) {
        const message = 'Đăng nhập thất bại! Tài khoản đang bị khóa!'
        return responsehandler(res, 200, message, {})
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
        'accessToken': accessToken,
        'refreshToken': refreshToken
    };
    return responsehandler(res, 200, message, data)
}

exports.refreshtoken = function (req, res, next) {
    const account = res.locals.account;
    const date = Math.floor(Date.now() / 1000);
    const expireAccessToken = date + parseInt(process.env.JWT_TOKEN_EXPIRATION);
    const expireRefreshToken = date + parseInt(process.env.JWT_REFRESHTOKEN_EXPIRATION);
    const accessToken = jwt.sign({ _id: account._id, role: account.role, expireIn: expireAccessToken }, process.env.JWT_KEY);
    const refreshToken = jwt.sign({ _id: account._id, role: account.role, expireIn: expireRefreshToken }, process.env.JWT_KEY);
    const data = {
        'expireIn': expireAccessToken,
        'role': account.role,
        'accessToken': accessToken,
        'refreshToken': refreshToken
    };
    return responsehandler(res, 200, 'Successfully', data)
}

exports.fortgotpassword = async function (req, res, next) {
    Account.findOne({ email: req.body.email })
        .then((account) => {
            if (!account) {
                return responsehandler(res, 200, 'Successfully', {});
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
                            `${process.env.ENVIROMENT}/accounts/reset/` + account.resetPasswordToken + '\n\n' +
                            'Note: The link is valid for 5 minutes. \n' +
                            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                    }
                    transporter.sendMail(mainOptions, function (err, info) {
                        if (err) {
                            next(err)
                        } else {
                            return responsehandler(res, 200, 'Successfully', {});
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
        return responsehandler(res, 200, 'Tài khoản không tồn tại!', {});
    }
    account.password = req.body.password;
    account.resetPasswordToken = '';
    account.save()
        .then(() => {
            return responsehandler(res, 200, 'Successfully', {});
        })
        .catch(err => next(err))
}

exports.changepassword = function (req, res, next) {
    const account = res.locals.account;
    account.password = req.body.password;
    account.save()
        .then(() => {
            return responsehandler(res, 200, 'Successfully', {});
        })
        .catch(err => next(err));
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
                        account.phonenumber = req.body.phonenumber;
                        account.save()
                            .then(() => {
                                user.firstname = req.body.firstname;
                                user.lastname = req.body.lastname;
                                let temp = user.lastname + " " + user.firstname;
                                user.namenosign = removeVietnameseTones(temp);
                                user.avatar = "/images/noimage.jpg"
                                user.birthday = req.body.birthday;
                                user.gender = req.body.gender;
                                user.save().then(() => {
                                    return responsehandler(res, 201, 'Successfully', {});
                                }).catch(err => {
                                    account.deleteOne({ _id: account._id });
                                    next(err);
                                });

                            })
                            .catch(err => next(err));
                    } else {
                        return responsehandler(res, 200, 'Tên đăng nhập hoặc email đã tồn tại!', {});
                    }
                }
            }
        );

    } catch (err) {
        next(err);
    }
}

exports.registermoderator = function (req, res, next) {
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
                            let temp = user.lastname + " " + user.firstname;
                            user.namenosign = removeVietnameseTones(temp);
                            user.avatar = "/images/noimage.jpg"
                            user.birthday = req.body.birthday;
                            user.gender = req.body.gender;
                            user.save().then(() => {
                                return responsehandler(res, 201, 'Successfully', {});
                            }).catch(err => {
                                account.deleteOne({ _id: account._id });
                                next(err);
                            })
                        }).catch(err => next(err));

                } else {
                    return responsehandler(res, 200, 'Tên đăng nhập hoặc email đã tồn tại!', {});
                }
            }
        }
    );
}

exports.getlistaccount = async function (req, res) {
    var query = {
        role: { "$ne": 'Administrator' }
    };
    var options = {
        select: 'islock _id username email phonenumber createdAt',
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 15
    };
    const account = await Account.paginate(query, options);
    account.docs.forEach(function (item) {
        item._doc.createdAt = moment(item._doc.createdAt).format('DD/MM/YYYY');
    });
    return responsehandler(res, 200, 'Successfully', account);
}

exports.getlistmoderator = async function (req, res) {
    var query = {
        role: 'Moderator'
    };
    var options = {
        select: 'islock _id username email phonenumber createdAt',
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 15
    };
    const account = await Account.paginate(query, options);
    account.docs.forEach(function (item) {
        item._doc.createdAt = moment(item._doc.createdAt).format('DD/MM/YYYY');
    });
    return responsehandler(res, 200, 'Successfully', account);
}

exports.findAccount = async function (req, res) {
    var query = {
        username: { $regex: '.*' + req.params.username + '.*' }
    };
    var options = {
        select: 'islock _id username email phonenumber createdAt',
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 15
    };
    const accounts = await Account.paginate(query, options);
    accounts.docs.forEach(function (item) {
        item._doc.createdAt = moment(item._doc.createdAt).format('DD/MM/YYYY');
    });
    return responsehandler(res, 200, 'Successfully', accounts);
}

exports.lockaccount = function (req, res, next) {
    let user_id = req.body.id;
    Account.findOne({ _id: user_id }, function (err, account) {
        if (err)
            next(err);
        else {
            account.islock = 1;
            account.save();
            account._doc.createdAt = moment(account._doc.createdAt).format('DD/MM/YYYY');
            const { __v, password, user_id, role, updatedAt, ...accNoField } = account._doc;
            return responsehandler(res, 200, 'Successfully', accNoField);
        }
    });
}

exports.unlockaccount = function (req, res, next) {
    let user_id = req.body.id;
    Account.findOne({ _id: user_id }, function (err, account) {
        if (err)
            next(err);
        else {
            account.islock = 0;
            account.save();
            account._doc.createdAt = moment(account._doc.createdAt).format('DD/MM/YYYY');
            const { __v, password, user_id, role, updatedAt, ...accNoField } = account._doc;
            return responsehandler(res, 200, 'Successfully', accNoField);
        }
    });
}