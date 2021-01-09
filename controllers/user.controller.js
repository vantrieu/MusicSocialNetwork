const moment = require('moment')
const User = require('../models/User');
const Follow = require('../models/Follow');
const fs = require('fs');
const responsehandler = require('../helpers/respone-handler');
const removeVietnameseTones = require('../helpers/convertVie-handler');
const buildMetaHandler = require('../helpers/build-meta-handler');
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

exports.createfollow = async function (req, res, next) {
    let follow_id = res.locals.account.user_id;
    let user_id = req.body.id;
    let follow = await Follow.findOne({ follow_id: follow_id, user_id: user_id });
    if (follow === null) {
        follow = new Follow();
        follow.follow_id = follow_id;
        follow.user_id = user_id;
        await follow.save();
    }
    return responsehandler(res, 201, 'Successfully', null, null);
}

exports.getfollowme = async function (req, res, next) {
    var lstfollow_id = [];
    let follows = await Follow.find({ user_id: res.locals.account.user_id }, ['follow_id']);
    follows.forEach(function (item) {
        lstfollow_id.push(item.follow_id)
    });
    var query = {
        //role: { "$ne": 'Administrator' }
        _id: { $in: lstfollow_id }
        //islock: { "$ne": 1 }
    };
    var options = {
        select: 'avatar _id firstname lastname gender',
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 15
    };
    let users = await User.paginate(query, options);
    users.docs.forEach(function (item) {
        if (item.avatar !== '')
            item.avatar = process.env.ENVIROMENT + item.avatar;
    });
    var meta = buildMetaHandler(users);
    return responsehandler(res, 200, 'Successfully', users.docs, meta);
}

exports.getfollowbyme = async function (req, res, next) {
    var lstfollow_id = [];
    let follows = await Follow.find({ follow_id: res.locals.account.user_id }, ['user_id']);
    follows.forEach(function (item) {
        lstfollow_id.push(item.user_id)
    });
    var query = {
        //role: { "$ne": 'Administrator' }
        _id: { $in: lstfollow_id }
        //islock: { "$ne": 1 }
    };
    var options = {
        select: 'avatar _id firstname lastname gender',
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 15
    };
    let users = await User.paginate(query, options);
    users.docs.forEach(function (item) {
        if (item.avatar !== '')
            item.avatar = process.env.ENVIROMENT + item.avatar;
    });
    var meta = buildMetaHandler(users);
    return responsehandler(res, 200, 'Successfully', users.docs, meta);
}

exports.unfollow = function (req, res, next) {
    Follow.findOneAndDelete({ follow_id: res.locals.account.user_id, user_id: req.body.id }, function (err) {
        if (err)
            next(err);
        else {
            return responsehandler(res, 201, 'Successfully', null, null);
        }
    });
}

exports.mymusic = async function (req, res, next) {
    let results = (await User.findById(res.locals.account.user_id, ['tracks'])).tracks;
    var query = {
        _id: { $in: results }
    };
    var options = {
        select: '_id tracklink total trackname description background createdAt',
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 100
    };
    let tracks = await Track.paginate(query, options);
    tracks.docs.forEach(function (item) {
        if (item.tracklink !== '')
            item.tracklink = process.env.ENVIROMENT + '/' + item.tracklink;
        item._doc.createdAt = moment(item._doc.createdAt).format('DD/MM/YYYY HH:mm:ss');
    });
    let meta = buildMetaHandler(tracks);
    return responsehandler(res, 200, 'Successfully', tracks.docs, meta);
}