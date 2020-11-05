const moment = require('moment')
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const nodemailer = require('nodemailer');
const fileUpload = require('express-fileupload');
const fs = require('fs');


exports.me = function (req, res) {
    const user = res.locals.user;
    user._doc.birthday = moment(user._doc.birthday).format('DD/MM/YYYY');
    user._doc.createdate = moment(user._doc.createdate).format('DD/MM/YYYY');
    const { password, __v, tokens, ...userNoField } = user._doc;
    res.status(200).send({
        'user': userNoField
    });
}

exports.create = async function (req, res, next) {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).send({
            message: 'User created!'
        })
    } catch (err) {
        next(err);
    }
}

exports.login = async function (req, res, next) {
    try {
        const pass = req.body.password;
        const username = req.body.username;
        const user = await User.findOne({ username });
        if (user == null) {
            res.status(200).send({ message: 'Invalid login credentials' });
        }
        const isPasswordMatch = await bcrypt.compare(pass, user.password)
        if (!isPasswordMatch) {
            res.status(200).send({ message: 'Invalid login credentials' });
        }
        if (!user) {
            return res.status(401).send({
                error: 'Login failed! Check authentication credentials'
            })
        }
        const token = await user.generateAuthToken();
        user._doc.birthday = moment(user._doc.birthday).format('DD/MM/YYYY');
        user._doc.createdate = moment(user._doc.createdate).format('DD/MM/YYYY');
        const { password, __v, tokens, ...userNoField } = user._doc;
        res.send({
            'user': userNoField,
            'token': token
        });
    } catch (error) {
        next(error);;
    }
}

exports.logout = async function (req, res, next) {
    try {
        res.locals.user.tokens = res.locals.user.tokens.filter((token) => {
            token.token != req.token
        });
        await res.locals.user.save();
        res.status(200).send({
            message: 'Success!'
        });
    } catch (err) {
        next(err);
    }
}

exports.logoutall = async function (req, res, next) {
    try {
        res.locals.user.tokens.splice(0, res.locals.user.tokens.length);
        await res.locals.user.save();
        res.status(200).send({
            message: 'Success!'
        });
    } catch (err) {
        next(err);
    }
}

exports.uploadimg = function (req, res, next) {
    try {
        if (!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            try {
                let avatar = req.files.avatar;
                const user = res.locals.user;
                if (avatar.mimetype == 'image/jpeg' || avatar.mimetype == 'image/png') {
                    let address = Date.now().toString() + avatar.name;
                    avatar.mv('./public/images/' + address);
                    try {
                        fs.unlinkSync('./public' + user.avatar);
                    } catch (err) {
                        console.error(err)
                    }
                    user.avatar = '/images/' + address;
                    user.save();
                    return res.status(201).json({
                        message: 'File uploded successfully'
                    });
                } else {
                    return res.status(400).json({
                        message: 'Chỉ chấp nhận định dạng jpeg hoặc png!'
                    });
                }
            } catch (err) {
                next(err);
            }
        }
    } catch (err) {
        res.status(500).send(err);
    }

};

exports.getotp = async function (req, res, next) {
    try {
        const username = req.body.username;
        const user = await User.findOne({ username: username });
        if (user == null) {
            return res.status(201).json({
                message: 'User not found'
            });
        }
        var otp = Math.floor(Math.random() * 1000000);
        var transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'music.social.network.developer@gmail.com',
                pass: 'Qpzm1092@'
            }
        });
        var mainOptions = {
            from: 'music.social.network.developer@gmail.com',
            to: user.email,
            subject: 'Test Nodemailer',
            html: '<p>You have got a new message</b><ul><li>Username:' + req.body.username + '</li></ul>'
        }
        transporter.sendMail(mainOptions, function (err, info) {
            if (err) {
                console.log(err)
                return res.status(500).json({
                    message: 'Internal Server Error'
                });
            } else {
                user.otp = otp;
                user.save();
                console.log(info);
                return res.status(200).json({
                    message: 'OTP was send!'
                });
            }
        });
    } catch (err) {
        next(err);
    }
}

exports.uploadmp3 = function (req, res, next) {
    try {
        if (!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            let fileMusic = req.files.music;
            if (fileMusic.mimetype != 'audio/mpeg') {
                res.status(400).send({
                    message: 'Chỉ chấp nhận tập tin định dạng mp3!'
                });
            } else {
                fileMusic.mv('./public/musics/' + fileMusic.name);
                res.status(201).send({
                    message: 'File is uploaded'
                });
            }
        }
    } catch (err) {
        res.status(500).send(err);
    }
}