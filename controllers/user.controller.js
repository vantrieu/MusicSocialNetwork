const moment = require('moment')
const User = require('../models/User');
const Follow = require('../models/Follow');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { listIndexes } = require('../models/Follow');
const Album = require('../models/Album');
const Track = require('../models/Track');

exports.me = function (req, res, next) {
    try {
        const account = res.locals.account.user_id;
        User.findById({ _id: account }, ['avatar', '_id', 'birthday', 'firstname', 'lastname', 'gender'], function (err, user) {
            if (err)
                next(err);
            else {
                user._doc.birthday = moment(user._doc.birthday).format('DD/MM/YYYY');
                //const { __v, createdAt, updatedAt, ...userNoField } = user._doc;
                return res.status(200).json({
                    'user': user._doc
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
                const user = await User.findById({ _id: res.locals.account.user_id });
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
                    return res.res.status(201).json({
                        message: 'File uploded successfully'
                    });
                } else {
                    return res.res.status(400).json({
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

}

exports.changeprofile = function (req, res, next) {
    try {
        const account = res.locals.account.user_id;
        User.findById({ _id: account }, function (req, err, user) {
            if (err)
                next(err);
            else {
                if (!isNaN(req.body.firstname))
                    user._doc.firstname = req.body.firstname;
                if (!isNaN(req.body.lastname))
                    user._doc.lastname = req.body.lastname;
                if (!isNaN(req.body.birthday))
                    user._doc.birthday = req.body.birthday;
                if (!isNaN(req.body.gender))
                    user._doc.gender = req.body.gender;
                return res.status(200).json({
                    message: 'Change profile success!'
                });
            }
        });
    } catch (err) {
        next(err);
    }
}

exports.createfollow = function (req, res, next) {
    try {
        let follow_id = res.locals.account.user_id;
        let user_id = req.body.id;
        let follow = new Follow();
        follow.follow_id = follow_id;
        follow.user_id = user_id;
        follow.save();
        return res.status(201).json({
            message: 'Follow user success!'
        });
    } catch {
        next(err)
    }
}

exports.getfollowme = async function (req, res, next) {
    try {
        var lstfollow_id = [];
        let follow = await Follow.find({ user_id: res.locals.account.user_id });
        follow.forEach(function (item) {
            lstfollow_id.push(item.follow_id)
        });
        let user = await User.find({}).where('_id').in(lstfollow_id);
        var lstuserfollow = [];
        user.forEach(function (item) {
            const { __v, gender, birthday, createdAt, updatedAt, ...userNoField } = item._doc;
            lstuserfollow.push(userNoField);
        });
        return res.status(200).json({
            users: lstuserfollow
        });
    } catch (err) {
        next(err);
    }
}

exports.getfollowbyme = async function (req, res, next) {
    try {
        var lstfollow_id = [];
        let follow = await Follow.find({ follow_id: res.locals.account.user_id });
        follow.forEach(function (item) {
            lstfollow_id.push(item.user_id)
        });
        let user = await User.find({}).where('_id').in(lstfollow_id);
        var lstuserfollow = [];
        user.forEach(function (item) {
            const { __v, gender, birthday, createdAt, updatedAt, ...userNoField } = item._doc;
            lstuserfollow.push(userNoField);
        });
        return res.status(200).json({
            users: lstuserfollow
        });
    } catch (err) {
        next(err);
    }
}

exports.unfollow = function (req, res, next) {
    try {
        Follow.findOneAndDelete({ follow_id: res.locals.account.user_id, user_id: req.body.id }, function (err) {
            if (err)
                next(err);
            else {
                return res.status(201).json({
                    message: 'UnFollow user success!'
                });
            }
        })
    } catch {
        next(err)
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

exports.mymusic = async function (req, res, next) {
    const result = (await User.findById(res.locals.account.user_id, ['tracks']).populate('tracks')).tracks;
    return res.status(200).json({
        'tracks': result
    })
}

exports.createAlbum = async function (req, res, next) {
    const user_id = res.locals.account.user_id;
    const { albumname, description } = req.value.body;
    let album = new Album({ user_id, albumname, description });
    let background = req.files.background;
    if (background.mimetype == 'image/jpeg' || background.mimetype == 'image/png') {
        let address = Math.floor(Date.now() / 1000).toString() + background.name;
        background.mv('./public/images/' + address);
        album.background = process.env.ENVIROMENT + '/images/' + address;
    } else {
        return res.res.status(400).json({
            message: 'Chỉ chấp nhận định dạng jpeg hoặc png!'
        });
    }
    await album.save()
        .then(() => {
            return res.status(201).json({
                message: 'Create success!'
            })
        })
        .catch(() => {
            fs.unlinkSync('./public/images/' + address);
        })
}

exports.addListTrackAlbum = async function (req, res, next) {
    const { listtrack, albumid } = req.body;
    const album = await Album.findById({ _id: albumid });
    listtrack.forEach(element => {
        album.tracks.push(element);
        Track.findById({ _id: element })
            .then(track => {
                track.album_id = albumid;
                track.save()
            })
    });
    await album.save();
    return res.status(200).json(album);
}