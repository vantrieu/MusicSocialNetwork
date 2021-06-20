const Singer = require('../models/Singer');
const responsehandler = require('../helpers/respone-handler');
const removeVietnameseTones = require('../helpers/convertVie-handler');
const fs = require('fs');
const { schedulingPolicy } = require('cluster');

exports.create = async function (req, res) {
    const singer = new Singer(req.body);
    singer.namenosign = removeVietnameseTones(singer.name);
    let avatar = req.files?.avatar;
    if (avatar) {
        if (avatar.mimetype == 'image/jpeg' || avatar.mimetype == 'image/png') {
            let address = Math.floor(Date.now() / 1000).toString() + avatar.name;
            avatar.mv('./public/images/' + address);
            singer.avatar = '/images/' + address;
        } else {
            return responsehandler(res, 400, 'Bad request', null, null);
        }
    }
    await singer.save();
    const { __v, tracks, updatedAt, createdAt, namenosign, ...singerNoField } = singer._doc;
    return responsehandler(res, 201, 'Successfully', { ...singerNoField }, null);
}

exports.update = async function (req, res) {
    var { name, description } = req.body;
    var singer = await Singer.findOne({ _id: req.params.id });
    let avatar = req.files?.avatar;
    if (avatar) {
        if (avatar.mimetype == 'image/jpeg' || avatar.mimetype == 'image/png') {
            let address = Math.floor(Date.now() / 1000).toString() + avatar.name;
            avatar.mv('./public/images/' + address);
            fs.unlinkSync('./public' + singer.avatar);
            singer.avatar = '/images/' + address;
        }
    }
    singer.name = name;
    singer.description = description;
    await singer.save();
    const { __v, tracks, updatedAt, createdAt, namenosign, ...singerNoField } = singer._doc;
    return responsehandler(res, 201, 'Successfully', { ...singerNoField }, null);
}

exports.getByID = async function (req, res) {
    let { id } = req.params;
    let singers = await Singer.findById(id, ['_id', 'name', 'description', 'avatar', 'createdAt', 'updatedAt'])
    .populate('albums tracks', ['_id', 'albumname', 'background', 'tracklink', 'trackname'])
    singers.tracks.forEach(function (item) {
        item._doc.tracklink = '/tracks/play/' + item._doc._id;
    })
    return responsehandler(res, 200, 'Successfully', singers, null);
}

exports.getList = async function (req, res) {
    let { name } = req.query;
    if (name) {
        var singers = await Singer.find({
            namenosign: {
                $regex: '.*' + name + '.*'
            }
        }, ['_id', 'name', 'description', 'avatar', 'createdAt', 'updatedAt']);
    }
    else {
        var singers = await Singer.find({}, ['_id', 'name', 'description', 'avatar', 'createdAt', 'updatedAt']);
    }
    return responsehandler(res, 200, 'Successfully', singers, null);
}

exports.getListOption = async function (req, res) {
    var singers = await Singer.find({}, ['_id', 'name']);
    return responsehandler(res, 200, 'Successfully', singers, null);
}