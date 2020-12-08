const Track = require('../models/Track');
const fs = require('fs');
const User = require('../models/User');
const mediaserver = require('mediaserver');
const path = require("path");
const { Error } = require('mongoose');
const responsehandler = require('../helpers/respone-handler');
const removeVietnameseTones = require('../helpers/convertVie-handler');

exports.createTrack = async function (req, res, next) {
    const track = new Track(req.body);
    track.namenosign = removeVietnameseTones(track.trackname);
    track.user_id = res.locals.account.user_id;
    let background = req.files.background;
    if (background.mimetype == 'image/jpeg' || background.mimetype == 'image/png') {
        let address = Math.floor(Date.now() / 1000).toString() + background.name;
        background.mv('./public/images/' + address);
        track.background = process.env.ENVIROMENT + '/images/' + address;
    } else {
        return responsehandler(res, 400, 'Bad request', null, null);
    }
    let fileMusic = req.files.music;
    if (fileMusic.mimetype != 'audio/mpeg') {
        return responsehandler(res, 400, 'Bad request', null, null);
    } else {
        let time = Math.floor(Date.now() / 1000).toString();
        fileMusic.mv('./musics/' + time + fileMusic.name);
        track.tracklink = 'musics/' + time + fileMusic.name;
    }
    await track.save()
        .then(async (track) => {
            console.log(res.locals.account.user_id);
            const user = await User.findById(res.locals.account.user_id);
            console.log(user);
            user.tracks.push(track._id);
            await user.save()
                .then(() => {
                    return responsehandler(res, 201, 'Successfully', null, null);
                })
        })
        .catch(() => {
            fs.unlinkSync('./public/images/' + address);
            fs.unlinkSync('./musics/' + fileMusic.name);
        })

}

exports.playmusic = async function (req, res, next) {
    const id = req.value.params.trackID;
    const track = await Track.findById(id);
    var link = path.join(track.tracklink);
    track.total = track.total + 1;
    await track.save();
    mediaserver.pipe(req, res, link);
}

exports.topmusic = async function (req, res, next) {
    const tracks = await Track.find({}, ['_id', 'total', 'tracklink', 'trackname', 'description', 'background'])
        .sort({ total: -1 })
        .limit(100);
    tracks.forEach(function (item) {
        item._doc.tracklink = process.env.ENVIROMENT + '/tracks/play/' + item._doc._id;
    })
    return responsehandler(res, 200, 'Successfully', tracks, null)
}

exports.findbyname = async function (req, res, next) {
    let keyword = removeVietnameseTones(req.body.trackname);
    const tracks = await Track.find({ namenosign: { $regex: '.*' + keyword + '.*' } }, ['_id', 'total', 'tracklink', 'trackname', 'description', 'background']);
    tracks.forEach(function (item) {
        item._doc.tracklink = process.env.ENVIROMENT + '/tracks/play/' + item._doc._id;
    })
    return responsehandler(res, 200, 'Successfully', tracks, null);
}