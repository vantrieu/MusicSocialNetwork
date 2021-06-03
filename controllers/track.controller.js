const Track = require('../models/Track');
const fs = require('fs');
const User = require('../models/User');
const mediaserver = require('mediaserver');
const path = require("path");
const responsehandler = require('../helpers/respone-handler');
const removeVietnameseTones = require('../helpers/convertVie-handler');
const buildMetaHandler = require('../helpers/build-meta-handler');
const History = require('../models/History');
const Singer = require('../models/Singer');
const saveImage = require('../services/save-images');
const saveMusic = require('../services/save-musics');
const removeFile = require('../services/remove-files');
const TrackType = require('../models/TrackType');
const Playlist = require('../models/Playlist');
const Album = require('../models/Album');

exports.createTrack = async function (req, res) {
    const track = new Track(req.body);
    track.namenosign = removeVietnameseTones(track.trackname);
    let background = req.files?.background;
    let fileMusic = req.files?.music;
    if (background) {
        let path = await saveImage(background);
        track.background = path;
    }
    if (fileMusic) {
        let path = await saveMusic(fileMusic);
        track.tracklink = path;
    }
    await track.save()
        .then(async (track) => {
            var singer = await Singer.findOne({ _id: track.singer });
            singer.tracks.push(track._id);
            var tracktype = await TrackType.findOne({ _id: track.tracktype });
            tracktype.tracks.push(track._id);
            await tracktype.save();
            await singer.save();
            return responsehandler(res, 201, 'Successfully', null, null);
        })
        .catch(async (err) => {
            await removeFile(`./public${track.background}`);
            await removeFile(track.tracklink);
            return responsehandler(res, 400, err, null, null);
        })
}

exports.updateTrack = async function (req, res) {
    const id = req.params.trackID;
    const track = await Track.findById(id);
    track.trackname = req.body.trackname;
    track.description = req.body.description;
    track.namenosign = removeVietnameseTones(track.trackname);
    let background = req.files?.background;
    if (background) {
        let path = await saveImage(background);
        await removeFile(`./public${track.background}`);
        track.background = path;
    }
    const { singer, tracktype } = req.body;
    if (singer && track.singer != singer) {
        let oldSinger = await Singer.findOne({ _id: track.singer });
        oldSinger.tracks.pull(track._id);
        await oldSinger.save();
        let newSinger = await Singer.findById(singer)
        newSinger.tracks.push(track._id);
        await newSinger.save();
        track.singer = singer;
    }
    if (tracktype && track.tracktype != tracktype) {
        let oldTracktype = await TrackType.findOne({ _id: track.tracktype });
        oldTracktype.tracks.pull(track._id);
        await oldTracktype.save();
        let newTracktype = await TrackType.findOne({ _id: tracktype });
        newTracktype.tracks.push(track._id);
        await newTracktype.save();
        track.tracktype = tracktype;
    }
    await track.save()
        .then(() => {
            return responsehandler(res, 200, 'Successfully', null, null);
        })
        .catch((err) => {
            return responsehandler(res, 500, err, null, null);
        })
}

exports.deleteTrack = async function (req, res) {
    const id = req.params.trackID;
    const track = await Track.findById(id);
    if (track) {
        await Track.deleteOne(track);
        await removeFile(`./public${track.background}`);
        await removeFile(track.tracklink);
        return responsehandler(res, 200, 'Successfully', null, null);
    }
    else {
        return responsehandler(res, 404, 'Not Found', null, null);
    }
}

exports.playmusicPrivate = async function (req, res) {
    const id = req.params.trackID;
    const track = await Track.findById(id);
    const user_id = req.params.userID;
    var user = await User.findById({ _id: user_id });
    if (user !== null && track !== null) {
        var link = path.join(track.tracklink);
        track.total = track.total + 1;
        await track.save();
        var history = new History();
        history.track = track.trackname;
        history.user = user_id;
        history.content = 'Bạn đã nghe bài hát ';
        await history.save();
        return mediaserver.pipe(req, res, link);
    }
    return responsehandler(res, 200, 'Not found', null, null);
}

exports.playmusicPublic = async function (req, res) {
    const id = req.params.trackID;
    const track = await Track.findById(id);
    if (track !== null) {
        var link = path.join(track.tracklink);
        track.total = track.total + 1;
        await track.save();
        return mediaserver.pipe(req, res, link);
    }
    return responsehandler(res, 200, 'Not found', null, null);
}

exports.topmusic = async function (req, res) {
    let limit = parseInt(req.query.limit) || 100;
    const tracks = await Track.find({},
        ['_id', 'total', 'tracklink', 'trackname', 'description', 'background', 'singer', 'tracktype'])
        .sort({ total: -1 })
        .limit(limit)
        .populate('singer', ['_id', 'name', 'avatar'])
        .populate('tracktype', ['_id', 'typename']);
    tracks.forEach(function (item) {
        item._doc.tracklink = '/tracks/play/' + item._doc._id;
    })
    return responsehandler(res, 200, 'Successfully', tracks, null)
}

exports.listmusic = async function (req, res) {
    var options = {
        select: '_id total tracklink trackname description background singer tracktype',
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        populate: { path: 'singer tracktype', select: '_id name avatar typename' },
    };
    if (req.query?.keyword) {
        let keyword = removeVietnameseTones(req.query.keyword);
        var query = {
            namenosign: { $regex: '.*' + keyword + '.*' },
        };
        var listTrack = await Track.paginate(query, options);
    } else {
        var listTrack = await Track.paginate({}, options);
    }

    listTrack.docs.forEach(function (item) {
        item._doc.tracklink = '/tracks/play/' + item._doc._id;
    })
    var meta = buildMetaHandler(listTrack);
    return responsehandler(res, 200, 'Successfully', listTrack.docs, meta);
}

exports.optionMusic = async function (req, res) {
    const id = req.params.trackID;
    const { tracks } = await Playlist.findById(id, ['tracks']);
    var options = {
        select: '_id total tracklink trackname description background singer tracktype',
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        populate: { path: 'singer tracktype', select: '_id name avatar typename' },
    };
    if (req.query?.keyword) {
        let keyword = removeVietnameseTones(req.query.keyword);
        if (tracks.length === 0) {
            var query = {
                namenosign: { $regex: '.*' + keyword + '.*' },
            };
            var listTrack = await Track.paginate(query, options);
        } else {
            var query = {
                _id: { $nin: tracks },
                namenosign: { $regex: '.*' + keyword + '.*' },
            };
            var listTrack = await Track.paginate(query, options);
        }

    } else {
        if (tracks.length === 0) {
            var listTrack = await Track.paginate({}, options);
        } else {
            var query = {
                _id: { $nin: tracks }
            };
            var listTrack = await Track.paginate(query, options);
        }
    }

    listTrack.docs.forEach(function (item) {
        item._doc.tracklink = '/tracks/play/' + item._doc._id;
    })
    var meta = buildMetaHandler(listTrack);
    return responsehandler(res, 200, 'Successfully', listTrack.docs, meta);
}

exports.optionAlbum = async function (req, res) {
    const id = req.params.trackID;
    const { tracks } = await Album.findById(id, ['tracks']);
    var options = {
        select: '_id total tracklink trackname description background singer tracktype',
        sort: 'trackname 1',
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        populate: { path: 'singer tracktype', select: '_id name avatar typename' },
    };
    if (req.query?.keyword) {
        let keyword = removeVietnameseTones(req.query.keyword);
        if (tracks.length === 0) {
            var query = {
                namenosign: { $regex: '.*' + keyword + '.*' },
                album: { $in: null }
            };
            var listTrack = await Track.paginate(query, options);
        } else {
            var query = {
                _id: { $nin: tracks },
                namenosign: { $regex: '.*' + keyword + '.*' },
                album: { $in: null }
            };
            var listTrack = await Track.paginate(query, options);
        }

    } else {
        if (tracks.length === 0) {
            var query = {
                album: { $in: null }
            };
            var listTrack = await Track.paginate(query, options);
        } else {
            var query = {
                _id: { $nin: tracks },
                album: { $in: null }
            };
            var listTrack = await Track.paginate(query, options);
        }
    }

    listTrack.docs.forEach(function (item) {
        item._doc.tracklink = '/tracks/play/' + item._doc._id;
    })
    var meta = buildMetaHandler(listTrack);
    return responsehandler(res, 200, 'Successfully', listTrack.docs, meta);
}

exports.findbyname = async function (req, res) {
    let keyword = removeVietnameseTones(req.body.trackname);
    var options = {
        select: '_id total tracklink trackname description background singer tracktype',
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        populate: { path: 'singer tracktype', select: '_id name avatar typename' },
    };
    //const tracks = await Track.find({ namenosign: { $regex: '.*' + keyword + '.*' } }, ['_id', 'total', 'tracklink', 'trackname', 'description', 'background']);
    // tracks.forEach(function (item) {
    //     item._doc.tracklink = '/tracks/play/' + item._doc._id;
    // })
    // return responsehandler(res, 200, 'Successfully', tracks, null);
    const listTrack = await Track.paginate({ namenosign: { $regex: '.*' + keyword + '.*' } }, options);

    listTrack.docs.forEach(function (item) {
        item._doc.tracklink = '/tracks/play/' + item._doc._id;
    })
    var meta = buildMetaHandler(listTrack);
    return responsehandler(res, 200, 'Successfully', listTrack.docs, meta);
}

exports.downloadFile = async function (req, res) {
    const trackname = req.params.trackname;
    const track = await Track.findOne({ trackname: trackname }, ['_id', 'tracklink', 'trackname']);
    const directoryPath = path.resolve(__dirname.replace('controllers', ''), track.tracklink);
    return res.download(directoryPath);
}