const responsehandler = require('../helpers/respone-handler');
const removeVietnameseTones = require('../helpers/convertVie-handler');
const Album = require('../models/Album');
const Track = require('../models/Track');

exports.createalbum = async function (req, res, next) {
    let album = new Album(req.body);
    album.user_id = res.locals.account.user_id;
    album.namenosign = removeVietnameseTones(album.albumname);
    let background = req.files.background;
    if (background.mimetype == 'image/jpeg' || background.mimetype == 'image/png') {
        let address = Math.floor(Date.now() / 1000).toString() + background.name;
        background.mv('./public/images/' + address);
        album.background = process.env.ENVIROMENT + '/images/' + address;
    } else {
        return responsehandler(res, 400, 'Bad request', null, null);
    }
    await album.save();
    return responsehandler(res, 201, 'Successfully', album, null);
}

exports.addtracktoalbum = async function (req, res, next) {
    let tracks = req.body.tracks;
    let album_id = req.body.album_id;
    let album = await Album.findById(album_id);
    tracks.forEach(element => {
        album.tracks.push(element);
        Track.findById({ _id: element })
            .then(track => {
                track.album_id = album_id;
                track.save()
            })
    });
    await album.save();
    return responsehandler(res, 200, 'Successfully', null, null);
}

exports.detail = async function (req, res, next) {
    let album_id = req.params.albumID;
    let album = await Album.findOne({ _id: album_id }, ['_id', 'total', 'albumname', 'description', 'background', 'tracks']);
    album.total += 1;
    await album.save();
    let tracks = await Track.find({}, ['_id', 'total', 'tracklink', 'trackname', 'description', 'background']).where('_id').in(album._doc.tracks);
    tracks.forEach(function (item) {
        item._doc.tracklink = process.env.ENVIROMENT + '/tracks/play/' + item._doc._id;
    });
    album.tracks = tracks;
    return responsehandler(res, 200, 'Successfully', album, null);
}