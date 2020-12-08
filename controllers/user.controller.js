const moment = require('moment')
const User = require('../models/User');
const Follow = require('../models/Follow');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const responsehandler = require('../helpers/respone-handler');
const removeVietnameseTones = require('../helpers/convertVie-handler');
const Album = require('../models/Album');
const Track = require('../models/Track');

exports.me = function (req, res, next) {
    const account = res.locals.account.user_id;
    User.findById({ _id: account }, ['avatar', '_id', 'birthday', 'firstname', 'lastname', 'gender'], function (err, user) {
        if (err)
            next(err);
        else {
            user._doc.birthday = moment(user._doc.birthday).format('DD/MM/YYYY');
            user.avatar = process.env.ENVIROMENT + user.avatar;
            return responsehandler(res, 200, 'Successfully', user, null);
        }
    });
}

exports.viewProfile = function (req, res, next) {
    const name = removeVietnameseTones(req.body.name);
    User.find({ namenosign: { $regex: '.*' + name + '.*' } }, ['avatar', '_id', 'birthday', 'firstname', 'lastname', 'gender'], function (err, users) {
        if (err)
            next(err);
        else {
            users.forEach(function (item) {
                item._doc.birthday = moment(item._doc.birthday).format('DD/MM/YYYY');
                if (item.avatar !== '')
                    item.avatar = process.env.ENVIROMENT + item.avatar;
            });
            return responsehandler(res, 200, 'Successfully', users, null);
        }
    });
}

exports.uploadimg = async function (req, res, next) {
    if (!req.files)
        return responsehandler(res, 400, 'Bad request', null, null);
    else {
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
                return responsehandler(res, 201, 'Successfully', null, null);
            } else {
                return responsehandler(res, 400, 'Only accept jpeg or png formats', null, null);
            }
        } catch (err) {
            next(err);
        }
    }
}

exports.changeprofile = async function (req, res, next) {
    const account = res.locals.account.user_id;
    const user = await User.findById({ _id: account })
    if (req.body.firstname !== undefined)
        user.firstname = req.body.firstname;
    if (req.body.lastname !== undefined)
        user.lastname = req.body.lastname;
    if (req.body.birthday !== undefined)
        user.birthday = req.body.birthday;
    if (req.body.gender !== undefined)
        user.gender = req.body.gender;
    let temp = user.lastname + " " + user.firstname;
    user.namenosign = removeVietnameseTones(temp);
    user.updatedAt = Date.now();
    await user.save();
    return responsehandler(res, 201, 'Successfully', null, null);
}

exports.createfollow = async function (req, res, next) {
    let follow_id = res.locals.account.user_id;
    let user_id = req.body.id;
    let follow = new Follow();
    follow.follow_id = follow_id;
    follow.user_id = user_id;
    await follow.save();
    return responsehandler(res, 201, 'Successfully', null, null);
}

exports.getfollowme = async function (req, res, next) {
    var lstfollow_id = [];
    let follows = await Follow.find({ user_id: res.locals.account.user_id }, ['follow_id']);
    follows.forEach(function (item) {
        lstfollow_id.push(item.follow_id)
    });
    let users = await User.find({}, ['avatar', 'firstname', 'lastname', 'gender']).where('_id').in(lstfollow_id);
    users.forEach(function (item) {
        item._doc.avatar = process.env.ENVIROMENT + item._doc.avatar;
    });
    return responsehandler(res, 200, 'Successfully', users, null);
}

exports.getfollowbyme = async function (req, res, next) {
    var lstfollow_id = [];
    let follows = await Follow.find({ follow_id: res.locals.account.user_id }, ['user_id']);
    follows.forEach(function (item) {
        lstfollow_id.push(item.user_id)
    });
    console.log(lstfollow_id)
    let users = await User.find({}, ['avatar', 'firstname', 'lastname', 'gender']).where('_id').in(lstfollow_id);
    users.forEach(function (item) {
        item._doc.avatar = process.env.ENVIROMENT + item._doc.avatar;
    });
    return responsehandler(res, 200, 'Successfully', users, null);
}

exports.unfollow = function (req, res, next) {
    Follow.findOneAndDelete({ follow_id: res.locals.account.user_id, user_id: req.body.id }, function (err) {
        if (err)
            next(err);
        else {
            return responsehandler(res, 200, 'Successfully', null, null);
        }
    });
}

exports.mymusic = async function (req, res, next) {
    const results = (await User.findById(res.locals.account.user_id).populate('tracks')).tracks;
    results.forEach(function (item) {
        item._doc.tracklink = process.env.ENVIROMENT + '/tracks/play/' + item._doc._id;
        item._doc.comments = undefined;
        item._doc.playlists = undefined;
        item._doc.user_id = undefined;
        item._doc.createdAt = undefined;
        item._doc.updatedAt = undefined;
        item._doc.__v = undefined;
    });
    return responsehandler(res, 200, 'Successfully', results, null);
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