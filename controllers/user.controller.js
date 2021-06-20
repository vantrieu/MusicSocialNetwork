const moment = require('moment')
const User = require('../models/User');
//const Follow = require('../models/Follow');
const fs = require('fs');
const responsehandler = require('../helpers/respone-handler');
const removeVietnameseTones = require('../helpers/convertVie-handler');
const buildMetaHandler = require('../helpers/build-meta-handler');
const Album = require('../models/Album');
const Track = require('../models/Track');
const Singer = require('../models/Singer');

exports.me = function (req, res, next) {
    const account = res.locals.account.user_id;
    User.findById({ _id: account }, ['avatar', '_id', 'birthday', 'firstname', 'lastname', 'gender'], function (err, user) {
        if (err)
            next(err);
        else {
            user._doc.birthday = moment(user._doc.birthday).format('DD/MM/YYYY');
            user.avatar = user.avatar;
            return responsehandler(res, 200, 'Successfully', user, null);
        }
    });
}

exports.find = async function (req, res, next) {
    let name = removeVietnameseTones(req.body.name);
    var query = {
        //role: { "$ne": 'Administrator' }
        namenosign: { $regex: '.*' + name + '.*' },
        isDelete: { "$ne": 1 }
    };
    var options = {
        select: 'avatar _id birthday firstname lastname gender',
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 15
    };
    let users = await User.paginate(query, options);
    users.docs.forEach(function (item) {
        item._doc.birthday = moment(item._doc.birthday).format('DD/MM/YYYY');
        if (item.avatar !== '')
            item.avatar = process.env.ENVIROMENT + item.avatar;
    });
    var meta = buildMetaHandler(users);
    return responsehandler(res, 200, 'Successfully', users.docs, meta);
}

exports.orther = async function (req, res, next) {
    let userID = req.body.id;
    let user = await User.findById({ _id: userID }, ['avatar', '_id', 'birthday', 'firstname', 'lastname', 'gender']);
    if (user) {
        user._doc.birthday = moment(user._doc.birthday).format('DD/MM/YYYY');
        user.avatar = process.env.ENVIROMENT + user.avatar;
        return responsehandler(res, 200, 'Successfully', user, null);
    } else {
        return responsehandler(res, 200, 'Successfully', {}, null);
    }
}

exports.uploadimg = async function (req, res, next) {
    if (!req.files)
        return responsehandler(res, 400, 'Không tồn tại tệp tin!', null, null);
    else {
        try {
            let avatar = req.files.avatar;
            const user = await User.findById({ _id: res.locals.account.user_id });
            if (avatar.mimetype == 'image/jpeg' || avatar.mimetype == 'image/png') {
                let address = Math.floor(Date.now() / 1000).toString() + avatar.name;
                avatar.mv('./public/images/' + address);
                if (user.avatar !== '/images/noimage.jpg') {
                    try {
                        fs.unlinkSync('./public' + user.avatar);
                    } catch (err) {
                        console.error(err)
                    }
                }
                user.avatar = '/images/' + address;
                user.save();
                return responsehandler(res, 201, 'Successfully', user, null);
            } else {
                return responsehandler(res, 400, 'Chỉ chấp nhận định dạng .jpeg hoặc .png', null, null);
            }
        } catch (err) {
            next(err);
        }
    }
}

exports.changeprofile = async function (req, res, next) {
    const userID = res.locals.account.user_id;
    let body = req.body;
    await User.updateOne({ _id: userID }, { $set: body });
    let user = await User.findOne({ _id: userID }, ['avatar', '_id', 'birthday', 'firstname', 'lastname', 'gender', 'namenosign']);
    let temp = user.lastname + " " + user.firstname;
    user.namenosign = removeVietnameseTones(temp);
    await user.save();
    user._doc.namenosign = undefined;
    user._doc.birthday = moment(user._doc.birthday).format('DD/MM/YYYY');
    user._doc.avatar = process.env.ENVIROMENT + user._doc.avatar;
    return responsehandler(res, 201, 'Successfully', user, null);
}

exports.UpdateProfile = async function (req, res, next) {
    const user = await User.findById({ _id: res.locals.account.user_id });
    if (req.files?.image) {
        try {
            let avatar = req.files.image;
            if (avatar.mimetype == 'image/jpeg' || avatar.mimetype == 'image/png') {
                let address = Math.floor(Date.now() / 1000).toString() + avatar.name;
                avatar.mv('./public/images/' + address);
                if (user.avatar !== '/images/noimage.jpg') {
                    try {
                        fs.unlinkSync('./public' + user.avatar);
                    } catch (err) {
                        console.error(err)
                    }
                }
                user.avatar = '/images/' + address;
            } else {
                return responsehandler(res, 400, 'Chỉ chấp nhận định dạng .jpeg hoặc .png', null, null);
            }
        } catch (err) {
            next(err);
        }
    }
    const userID = res.locals.account.user_id;
    let body = req.body;
    await User.updateOne({ _id: userID }, { $set: body });
    let temp = user.lastname + " " + user.firstname;
    user.namenosign = removeVietnameseTones(temp);
    await user.save();
    return responsehandler(res, 200, 'Successfully', null, null);
}

exports.likeSinger = async function (req, res) {
    const userId = res.locals.account.user_id;
    const { singerId } = req.params;
    let user = await User.findById(userId);
    let singer = await Singer.findById(singerId);
    if (singer && user) {
        if(user.singers.includes(singerId) || singer.users.includes(userId))
            return responsehandler(res, 400, 'Bad Request', null, null);
        user.singers.push(singerId);
        singer.users.push(userId);
        await user.save();
        await singer.save();
        return responsehandler(res, 200, 'Successfully', null, null);
    }
    return responsehandler(res, 400, 'Bad Request', null, null);
}

exports.likeAlbum = async function (req, res) {
    const userId = res.locals.account.user_id;
    const { albumId } = req.params;
    let user = await User.findById(userId);
    let album = await Album.findById(albumId);
    if (album && user) {
        if(user.albums.includes(albumId) || album.users.includes(userId))
            return responsehandler(res, 400, 'Bad Request', null, null);
        user.albums.push(albumId);
        album.users.push(userId);
        await user.save();
        await album.save();
        return responsehandler(res, 200, 'Successfully', null, null);
    }
    return responsehandler(res, 400, 'Bad Request', null, null);
}

exports.likeTrack = async function (req, res) {
    const userId = res.locals.account.user_id;
    const { trackId } = req.params;
    let user = await User.findById(userId);
    let track = await Track.findById(trackId);
    if (track && user) {
        if(user.tracks.includes(trackId) || track.users.includes(userId))
            return responsehandler(res, 400, 'Bad Request', null, null);
        user.tracks.push(trackId);
        track.users.push(userId);
        await user.save();
        await track.save();
        return responsehandler(res, 200, 'Successfully', null, null);
    }
    return responsehandler(res, 400, 'Bad Request', null, null);
}

exports.unLikeSinger = async function (req, res) {
    const userId = res.locals.account.user_id;
    const { singerId } = req.params;
    let user = await User.findById(userId);
    let singer = await Singer.findById(singerId);
    if (singer && user) {
        user.singers.pull(singerId);
        singer.users.pull(userId);
        await user.save();
        await singer.save();
        return responsehandler(res, 200, 'Successfully', null, null);
    }
    return responsehandler(res, 400, 'Bad Request', null, null);
}

exports.unLikeAlbum = async function (req, res) {
    const userId = res.locals.account.user_id;
    const { albumId } = req.params;
    let user = await User.findById(userId);
    let album = await Album.findById(albumId);
    if (album && user) {
        user.albums.pull(albumId);
        album.users.pull(userId);
        await user.save();
        await album.save();
        return responsehandler(res, 200, 'Successfully', null, null);
    }
    return responsehandler(res, 400, 'Bad Request', null, null);
}

exports.unLikeTrack = async function (req, res) {
    const userId = res.locals.account.user_id;
    const { trackId } = req.params;
    let user = await User.findById(userId);
    let track = await Track.findById(trackId);
    if (track && user) {
        user.tracks.pull(trackId);
        track.users.pull(userId);
        await user.save();
        await track.save();
        return responsehandler(res, 200, 'Successfully', null, null);
    }
    return responsehandler(res, 400, 'Bad Request', null, null);
}