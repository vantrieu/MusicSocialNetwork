const responsehandler = require('../helpers/respone-handler');
const removeVietnameseTones = require('../helpers/convertVie-handler');
const moment = require('moment');
const Playlist = require('../models/Playlist');
const Track = require('../models/Track');
const saveImage = require('../services/save-images');
const saveMusic = require('../services/save-musics');
const removeFile = require('../services/remove-files');
const buildMetaHandler = require('../helpers/build-meta-handler');

exports.createPlaylist = async function (req, res) {
    let playlist = new Playlist(req.body);
    playlist.namenosign = removeVietnameseTones(playlist.playlistname);
    let background = req.files?.background;
    if (background) {
        let path = await saveImage(background);
        playlist.background = path;
    }
    await playlist.save();
    return responsehandler(res, 200, 'Successfully', playlist, null);
}

exports.addTrackToPlaylist = async function (req, res) {
    const { playlist_id, track_ids } = req.body;
    let playlist = await Playlist.findById(playlist_id);
    for (const track_id of track_ids) {
        playlist.tracks.push(track_id);
        let track = await Track.findById(track_id);
        track.playlists.push(playlist._id)
        await track.save();
    }
    await playlist.save();
    return responsehandler(res, 200, 'Successfully', null, null);
}

exports.detailPlaylist = async function (req, res, next) {
    const playlist_id = req.params.ID;
    const playlist = await Playlist.findById(playlist_id, ['total','tracks', 'playlistname', 'description', 'background', 'createdAt', '_id']);
    playlist._doc.createdAt = moment(playlist._doc.createdAt).format('DD/MM/YYYY');
    playlist.total += 1;
    let tracks = await Track.find({}, ['_id', 'total', 'tracklink', 'trackname', 'description', 'background']).where('_id').in(playlist._doc.tracks);
    tracks.forEach(function (item) {
        item._doc.tracklink = '/tracks/play/' + item._doc._id;
    });
    await playlist.save();
    playlist.tracks = tracks;
    playlist.updatedAt = undefined;
    return responsehandler(res, 200, 'Successfully', playlist, null);
}

exports.listPlaylist = async function (req, res) {
    var options = {
        select: 'total tracks playlistname description background createdAt _id ',
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        populate: { path: 'tracks', select: '_id trackname description tracklink'},
    };
    let listPlaylist = await Playlist.paginate({}, options);

    listPlaylist.docs.forEach(function (item) {
        item._doc.tracklink = '/tracks/play/' + item._doc._id;
    })
    
    var meta = buildMetaHandler(listPlaylist);
    return responsehandler(res, 200, 'Successfully', listPlaylist.docs, meta);
}

exports.delete = async function (req, res) {
    const playlist_id = req.params.ID;
    const track_ids = await Playlist.findOneAndDelete(playlist_id, ['tracks']);
    for (const track_id of track_ids.tracks) {
        let track = await Track.findById(track_id);
        track.playlists.pull(playlist_id);
        await track.save();
    }
    return responsehandler(res, 200, 'Successfully', null, null);
}

exports.removeTrack = async function (req, res) {
    let track_id = req.body.track_id;
    let playlist_id = req.body.playlist_id;
    let playlist = await Playlist.findById(playlist_id);
    playlist.tracks.pull(track_id);
    await playlist.save();
    let track = await Track.findById(track_id);
    track.playlists.pull(playlist_id);
    await track.save();
    return responsehandler(res, 200, 'Successfully', null, null);
}

exports.delete = async function(req, res) {
    const playlistID = req.params.playlistID;
    const playlist = await Playlist.findByIdAndDelete(playlistID);
    const tracks = await Track.find({_id: { $in: playlist._doc.tracks }})
    for (const track of tracks) {
        track.playlists.pull(playlistID);
        await track.save();
    }
    return responsehandler(res, 200, 'Successfully', [], null);
}