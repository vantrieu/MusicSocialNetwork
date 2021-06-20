const responsehandler = require('../helpers/respone-handler');
const removeVietnameseTones = require('../helpers/convertVie-handler');
const moment = require('moment');
const Playlist = require('../models/Playlist');
const Track = require('../models/Track');
const saveImage = require('../services/save-images');
const saveMusic = require('../services/save-musics');
const removeFile = require('../services/remove-files');
const buildMetaHandler = require('../helpers/build-meta-handler');
const User = require('../models/User');

exports.createPlaylist = async function (req, res) {
    let playlist = new Playlist(req.body);
    const userId = res.locals.account.user_id;
    let user = await User.findById(userId);
    playlist.namenosign = removeVietnameseTones(playlist.playlistname);
    playlist.users = userId;
    let background = req.files?.background;
    if (background) {
        let path = await saveImage(background);
        playlist.background = path;
    }
    await playlist.save();
    user.playlists.push(playlist._id);
    await user.save();
    return responsehandler(res, 200, 'Successfully', playlist, null);
}

exports.addTrackToPlaylist = async function (req, res) {
    const userId = res.locals.account.user_id;
    const { playlist_id, track_ids } = req.body;
    let playlist = await Playlist.findById(playlist_id);
    if (playlist.users != userId)
        return responsehandler(res, 200, 'Bad Request', null, null);
    for (const track_id of track_ids) {
        playlist.tracks.push(track_id);
        let track = await Track.findById(track_id);
        track.playlists.push(playlist._id)
        await track.save();
    }
    await playlist.save();
    return responsehandler(res, 200, 'Successfully', null, null);
}

exports.detailPlaylist = async function (req, res) {
    const playlist_id = req.params.ID;
    const userId = res.locals.account.user_id;
    const playlist = await Playlist.findOne({ _id: playlist_id, users: userId }, ['tracks', 'playlistname', 'description', 'background', 'createdAt', '_id']);
    if (playlist.tracks) {
        let tracks = await Track.find({}, ['_id', 'total', 'tracklink', 'trackname', 'description', 'background', 'singer'])
            .where('_id').in(playlist._doc.tracks)
            .populate('singer', ['_id', 'name'])
            .sort({ trackname: 1 });
        tracks.forEach(function (item) {
            item._doc.tracklink = '/tracks/play/' + item._doc._id;
        });
        playlist.tracks = tracks;
    }
    return responsehandler(res, 200, 'Successfully', playlist, null);
}

exports.listPlaylist = async function (req, res) {
    const userId = res.locals.account.user_id;
    let playlists = await Playlist.find({ users: userId }, ['playlistname', 'description', 'background', 'createdAt', '_id '])
    return responsehandler(res, 200, 'Successfully', playlists, null);
}

exports.delete = async function (req, res) {
    const userId = res.locals.account.user_id;
    const playlist_id = req.params.ID;
    const track = await Playlist.findByIdAndDelete(playlist_id, ['tracks', 'background']);
    if (track.users !== userId)
        return responsehandler(res, 200, 'Bad Request', null, null);
    if (track) {
        track.tracks.map(async (id) => {
            let track = await Track.findById(id);
            track.playlists.pull(playlist_id);
            await track.save();
        });
        await removeFile(`./public${track.background}`);
    }
    return responsehandler(res, 200, 'Successfully', null, null);
}

exports.removeTrack = async function (req, res) {
    const userId = res.locals.account.user_id;
    let track_id = req.body.track_id;
    let playlist_id = req.body.playlist_id;
    let playlist = await Playlist.findById(playlist_id);
    if (playlist.users != userId)
        return responsehandler(res, 200, 'Bad Request', null, null);
    playlist.tracks.pull(track_id);
    await playlist.save();
    let track = await Track.findById(track_id);
    track.playlists.pull(playlist_id);
    await track.save();
    return responsehandler(res, 200, 'Successfully', null, null);
}