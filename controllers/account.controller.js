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
var randomstring = require("randomstring");

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
    const err = validationResult(req);
    if (!err.isEmpty()) {
        return res.status(422).json({
            error: err.array()[0].msg
        })
    }
    const { password, username } = req.body;
    const account = await Account.findOne({ username });
    if (account == null) {
        return res.status(401).json({
            error: 'Tên đăng nhập hoặc mật khẩu không đúng!'
        })
    }
    const isPasswordMatch = await bcrypt.compare(password, account.password)
    if (!isPasswordMatch) {
        return res.status(401).json({
            error: 'Tên đăng nhập hoặc mật khẩu không đúng!'
        })
    }
    if (account.islock === 1) {
        return res.status(401).json({
            error: 'Tài khoản đang bị khóa!'
        })
    }
    const date = Math.floor(Date.now() / 1000);
    const expireAccessToken = date + parseInt(process.env.JWT_TOKEN_EXPIRATION);
    const accessToken = jwt.sign({ _id: account._id, role: account.role, expireIn: expireAccessToken }, process.env.JWT_KEY);
    const refreshToken = randomstring.generate(50);
    account.refreshToken = refreshToken;
    await account.save();
    const data = {
        'expireIn': expireAccessToken,
        'role': account.role,
        'accessToken': accessToken,
        'refreshToken': refreshToken
    };
    return responsehandler(res, 200, 'Successfully', data, null);
}

exports.refreshtoken = async function (req, res) {
    let refreshToken = req.headers['x-refresh-token'];
    const account = res.locals.account;
    if (account.refreshToken !== refreshToken)
        return res.status(403).json({
            error: 'Không có quyền truy cập tài nguyên này!'
        })
    refreshToken = randomstring.generate(50);
    account.refreshToken = refreshToken;
    await account.save();
    const date = Math.floor(Date.now() / 1000);
    const expireAccessToken = date + parseInt(process.env.JWT_TOKEN_EXPIRATION);
    const accessToken = jwt.sign({ _id: account._id, role: account.role, expireIn: expireAccessToken }, process.env.JWT_KEY);
    const data = {
        'expireIn': expireAccessToken,
        'accessToken': accessToken,
        'refreshToken': refreshToken
    };
    return res.status(200).json(data);
}

exports.fortgotpassword = async function (req, res, next) {
    Account.findOne({ email: req.body.email })
        .then((account) => {
            if (!account) {
                return res.status(200).send();
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
                        subject: 'Khôi phục mật khẩu',
                        text: 'Bạn nhận được thông báo này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản của bạn.\n' +
                            'Vui lòng nhấp vào liên kết dưới đây hoặc sao chép liên kết và dán vào trình duyệt của bạn để hoàn tất quá trình:\n\n' +
                            'https://kltn-admin.vercel.app/reset-password/' + account.resetPasswordToken + '\n\n' +
                            'Lưu ý: Liên kế chỉ có hiệu lực trong 5 phút kể từ khi nhận được thư này! \n' +
                            'Nếu bạn không yêu cầu điều này, vui lòng bỏ qua thư này và mật khẩu của bạn sẽ không thay đổi!\n'
                    }
                    transporter.sendMail(mainOptions, function (err, info) {
                        if (err) {
                            next(err)
                        } else {
                            return res.status(200).send();
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

exports.changepassword2 = async function (req, res, next) {
    const account = res.locals.account;
    const { currentPassword, newPassword } = req.body;
    const isPasswordMatch = await bcrypt.compare(currentPassword, account.password)
    if (!isPasswordMatch) {
        return responsehandler(res, 400, 'Mật khẩu hiện tại không đúng!', null, null);
    }
    account.password = newPassword;
    account.save()
        .then(() => {
            return responsehandler(res, 200, 'Successfully', null, null);
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
                        return responsehandler(res, 200, 'Tên đăng nhập hoặc email đã tồn tại!', {}, null);
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
    let keyword = req.query?.keyword;
    if (keyword) {
        var query = {
            role: 'User',
            isDelete: { "$ne": 1 },
            username: { $regex: '.*' + keyword + '.*' }
        };
    } else {
        var query = {
            role: 'User',
            isDelete: { "$ne": 1 }
        };
    }
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
    let keyword = req.query?.keyword;
    if (keyword) {
        var query = {
            role: 'Moderator',
            isDelete: { "$ne": 1 },
            username: { $regex: '.*' + keyword + '.*' }
        };
    } else {
        var query = {
            role: 'Moderator',
            isDelete: { "$ne": 1 }
        };
    }
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

exports.lockaccount = async function (req, res, next) {
    let user_id = req.body.id;
    let account = await Account.findById(user_id);
    if (account) {
        account.islock = 1;
        await account.save();
        return responsehandler(res, 200, 'Successfully', null, null);
    }
    return responsehandler(res, 400, 'Not Found', accNoField, null);
}

exports.unlockaccount = async function (req, res, next) {
    let user_id = req.body.id;
    let account = await Account.findById(user_id);
    if (account) {
        account.islock = 0;
        await account.save();
        return responsehandler(res, 200, 'Successfully', null, null);
    }
    return responsehandler(res, 400, 'Not Found', null, null);
}

exports.loginFacebook = async function (req, res) {
    var { id, firstname, lastname, gender, birthday, picture, email } = req.body;
    var user = new User();
    var flag = await User.findOne({ fbid: id });
    if (isEmpty(flag)) {
        var account = new Account();
        account.user_id = user._id;
        account.email = email;
        account.username = removeVietnameseTones(lastname + firstname);
        account.password = Math.random().toString(36).substring(4);
        account.role = 'User';
        await account.save();
        user.fbid = id;
        user.firstname = firstname;
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
        var account = await Account.findOne({ user_id: flag._id });
        if (account.islock === 1) {
            return responsehandler(res, 200, 'Tài khoản đang bị khóa!', {}, null);
        } else {
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
}

exports.deleteModerator = async function (req, res, next) {
    let user_id = req.body.id;
    var account = await Account.findOne({ _id: user_id, role: 'Moderator' });
    if (account != null) {
        account.isDelete = 1;
        await account.save();
        return responsehandler(res, 200, 'Successfully', account, null);
    } else {
        return responsehandler(res, 200, 'Tài khoản không tồn tại!', {}, null);
    }
}

exports.loginGoogle = async function (req, res) {
    var { id, firstname, lastname, picture, email } = req.body;
    var user = new User();
    var flag = await User.findOne({ ggid: id });
    if (isEmpty(flag)) {
        var account = new Account();
        account.user_id = user._id;
        account.email = email;
        account.username = removeVietnameseTones(lastname + firstname);
        account.password = Math.random().toString(36).substring(4);
        account.role = 'User';
        await account.save();
        user.ggid = id;
        user.firstname = firstname;
        user.lastname = lastname;
        user.namenosign = removeVietnameseTones(user.lastname + ' ' + user.firstname);
        //let address = '/images/' + Math.floor(Date.now() / 1000).toString() + 'img.png';
        //await download_image(picture, './public' + address);
        user.avatar = picture;
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
        var account = await Account.findOne({ user_id: flag._id });
        if (account.islock === 1) {
            return responsehandler(res, 200, 'Tài khoản đang bị khóa!', data, null);
        } else {
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
}