const Account = require('../models/Account');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const moment = require('moment');
const responsehandler = require('../helpers/respone-handler');
const removeVietnameseTones = require('../helpers/convertVie-handler');
const { validationResult } = require('express-validator');
const buildMetaHandler = require('../helpers/build-meta-handler');
const axios = require('axios');
const fs = require('fs');

function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function download_image(url, image_path) {
    axios({
        url,
        responseType: 'stream',
    }).then(
        response =>
            new Promise((resolve, reject) => {
                response.data
                    .pipe(fs.createWriteStream(image_path))
                    .on('finish', () => resolve())
                    .on('error', e => reject(e));
            }),
    );
}

exports.login = async function (req, res) {
    const pass = req.body.password;
    const username = req.body.username;
    const account = await Account.findOne({ username });
    // return result if the username is not found in the database
    if (account == null) {
        const message = 'Đăng nhập thất bại! Tài khoản không tồn tại!'
        return responsehandler(res, 200, message, [], null);
    }
    const isPasswordMatch = await bcrypt.compare(pass, account.password)
    // return result if password does not match
    if (!isPasswordMatch) {
        const message = 'Đăng nhập thất bại! Tên đăng nhập hoặc mật khẩu không đúng!'
        return responsehandler(res, 200, message, [], null);
    }
    // return result if the account is locked
    if (account.islock === 1) {
        const message = 'Đăng nhập thất bại! Tài khoản đang bị khóa!'
        return responsehandler(res, 200, message, [], null);
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
    return responsehandler(res, 200, message, data, null);
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
    return responsehandler(res, 200, 'Successfully', data, null)
}

exports.fortgotpassword = async function (req, res, next) {
    Account.findOne({ email: req.body.email })
        .then((account) => {
            if (!account) {
                return responsehandler(res, 200, 'Successfully', [], null);
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
                            return responsehandler(res, 200, 'Successfully', [], null);
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
        return responsehandler(res, 200, 'Tài khoản không tồn tại!', [], null);
    }
    account.password = req.body.password;
    account.resetPasswordToken = '';
    account.save()
        .then(() => {
            return responsehandler(res, 200, 'Successfully', [], null);
        })
        .catch(err => next(err))
}

exports.changepassword = function (req, res, next) {
    const account = res.locals.account;
    account.password = req.body.password;
    account.save()
        .then(() => {
            return responsehandler(res, 200, 'Successfully', [], null);
        })
        .catch(err => next(err));
}

exports.registeraccount = function (req, res, next) {
    const err = validationResult(req);
    if (!err.isEmpty()) {
        return responsehandler(res, 422, err.array()[0].msg, {}, null);
    }
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
                                    account._doc.createdAt = moment(account._doc.createdAt).format('DD/MM/YYYY');
                                    const { __v, password, user_id, role, updatedAt, ...accNoField } = account._doc;
                                    return responsehandler(res, 201, 'Successfully', { ...accNoField }, null);
                                }).catch(err => {
                                    account.deleteOne({ _id: account._id });
                                    next(err);
                                });

                            })
                            .catch(err => next(err));
                    } else {
                        return responsehandler(res, 422, 'Tên đăng nhập hoặc email đã tồn tại!', {}, null);
                    }
                }
            }
        );

    } catch (err) {
        next(err);
    }
}

exports.registermoderator = function (req, res, next) {
    const err = validationResult(req);
    if (!err.isEmpty()) {
        return responsehandler(res, 422, err.array()[0].msg, {}, null);
    }
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
                                account._doc.createdAt = moment(account._doc.createdAt).format('DD/MM/YYYY');
                                const { __v, password, user_id, role, updatedAt, ...accNoField } = account._doc;
                                return responsehandler(res, 201, 'Successfully', { ...accNoField }, null);
                            }).catch(err => {
                                account.deleteOne({ _id: account._id });
                                next(err);
                            })
                        }).catch(err => next(err));

                } else {
                    return responsehandler(res, 200, 'Tên đăng nhập hoặc email đã tồn tại!', {}, null);
                }
            }
        }
    );
}

exports.getlistaccount = async function (req, res) {
    var query = {
        //role: { "$ne": 'Administrator' }
        role: 'User'
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
    var meta = buildMetaHandler(account);
    return responsehandler(res, 200, 'Successfully', account.docs, meta);
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
    var meta = buildMetaHandler(account);
    return responsehandler(res, 200, 'Successfully', account.docs, meta);
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
    var meta = buildMetaHandler(accounts);
    return responsehandler(res, 200, 'Successfully', accounts.docs, meta);
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
            return responsehandler(res, 200, 'Successfully', accNoField, null);
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
            return responsehandler(res, 200, 'Successfully', accNoField, null);
        }
    });
}

exports.loginFacebook = async function (req, res) {
    var { id, firstname, lastname, middlename, gender, birthday, picture, email } = req.body;
    var user = new User();
    var flag = await User.findOne({ fbid: id });
    if (isEmpty(flag)) {
        var account = new Account();
        account.user_id = user._id;
        account.email = email;
        account.username = removeVietnameseTones(lastname + middlename + firstname);
        account.password = Math.random().toString(36).substring(4);
        account.role = 'User';
        await account.save();
        user.fbid = id;
        user.firstname = middlename + ' ' + firstname;
        user.lastname = lastname;
        if (gender === 'male') {
            user.gender = 'Nam';
        } else if (gender === 'female') {
            user.gender = 'Nữ';
        }
        user.birthday = birthday;
        user.namenosign = removeVietnameseTones(user.lastname + ' ' + user.firstname);
        let address = '/images/' + Math.floor(Date.now() / 1000).toString() + 'img.png';
        await download_image(picture, './public' + address);
        user.avatar = address;
        await user.save();
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
        return responsehandler(res, 200, message, data, null);
    } else {
        var account = await Account.findOne({user_id: flag._id});
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
        return responsehandler(res, 200, message, data, null);
    }
}