const Track = require('../models/Track');
const fs = require('fs');
const User = require('../models/User');
const mediaserver = require('mediaserver');
const path = require("path");

exports.createTrack = async function (req, res, next) {
    const track = new Track(req.body);
    track.user_id = res.locals.account.user_id;
    let background = req.files.background;
    if (background.mimetype == 'image/jpeg' || background.mimetype == 'image/png') {
        let address = Math.floor(Date.now() / 1000).toString() + background.name;
        background.mv('./public/images/' + address);
        track.background = process.env.ENVIROMENT + '/images/' + address;
    } else {
        return res.res.status(400).json({
            message: 'Chỉ chấp nhận định dạng jpeg hoặc png!'
        });
    }
    let fileMusic = req.files.music;
    if (fileMusic.mimetype != 'audio/mpeg') {
        return res.status(400).send({
            message: 'Chỉ chấp nhận tập tin định dạng mp3!'
        });
    } else {
        let time = Math.floor(Date.now() / 1000).toString();
        fileMusic.mv('./musics/' + time + fileMusic.name);
        track.tracklink = 'musics/' + time + fileMusic.name;
    }
    await track.save()
        .then(async (track) => {
            const user = await User.findById(res.locals.account.user_id);
            user.tracks.push(track._id);
            await user.save()
                .then(() => {
                    return res.status(201).json({
                        track
                    });
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

exports.listmusic = async function (req, res, next) {
    const account = res.locals.account;
    const tracks = await Track.find({}, 
        ['total', 'album_id', 'playlists', '_id', 'trackname', 'description', 'background']);
    return res.status(200).json({
        tracks
    })
}