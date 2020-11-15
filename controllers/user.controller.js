const moment = require('moment')
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const jwt = require('jsonwebtoken');

exports.me = function (req, res, next) {
    try {
        const account = res.locals.account.user_id;
        User.findById({ _id: account }, function (err, user) {
            if (err)
                next(err);
            else {
                user._doc.birthday = moment(user._doc.birthday).format('DD/MM/YYYY');
                const {__v,  ...userNoField } = user._doc;
                return res.status(200).send({
                    'user': userNoField
                });
            }
        });
    } catch (err) {
        next(err);
    }

}

exports.uploadimg = async function (req, res, next) {
    try {
        if (!req.files) {
            return res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            try {
                let avatar = req.files.avatar;
                const user = await User.findById({_id: res.locals.account.user_id});
                if (avatar.mimetype == 'image/jpeg' || avatar.mimetype == 'image/png') {
                    let address = Math.floor(Date.now() / 1000).toString() + avatar.name;
                    avatar.mv('./public/images/' + address);
                    try {
                        fs.unlinkSync('./public' + user.avatar);
                    } catch (err) {
                        console.error(err)
                    }
                    user.avatar = '/images/' + address;
                    user.save();
                    return res. res.status(201).json({
                        message: 'File uploded successfully'
                    });
                } else {
                    return res. res.status(400).json({
                        message: 'Chỉ chấp nhận định dạng jpeg hoặc png!'
                    });
                }
            } catch (err) {
                next(err);
            }
        }
    } catch (err) {
        return res.status(500).send(err);
    }

};

exports.getotp = async function (req, res, next) {
    try {
        const username = req.body.username;
        const user = await User.findOne({ username: username });
        if (user == null) {
            return res. res.status(201).json({
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
                return res. res.status(500).json({
                    message: 'Internal Server Error'
                });
            } else {
                user.otp = otp;
                user.save();
                console.log(info);
                return res. res.status(200).json({
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
            return res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            let fileMusic = req.files.music;
            if (fileMusic.mimetype != 'audio/mpeg') {
                return res.status(400).send({
                    message: 'Chỉ chấp nhận tập tin định dạng mp3!'
                });
            } else {
                fileMusic.mv('./public/musics/' + fileMusic.name);
                return res.status(201).send({
                    message: 'File is uploaded'
                });
            }
        }
    } catch (err) {
        return res.status(500).send(err);
    }
}
