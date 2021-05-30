const responsehandler = require('../helpers/respone-handler');
const removeVietnameseTones = require('../helpers/convertVie-handler');
const Album = require('../models/Album');
const Track = require('../models/Track');
const Singer = require('../models/Singer');
const saveImage = require('../services/save-images');
const removeFile = require('../services/remove-files');
const buildMetaHandler = require('../helpers/build-meta-handler');

exports.createAlbum = async function (req, res) {
    let album = new Album(req.body);
    album.namenosign = removeVietnameseTones(album.albumname);
    let background = req.files?.background;
    if (background) {
        let path = await saveImage(background);
        album.background = path;
    }
    await album.save()
        .then(async () => {
            album.singers.forEach(async element => {
                let singer = await Singer.findOne({ _id: element._id });
                singer.albums.push(album._id);
                await singer.save();
            });
            return responsehandler(res, 201, 'Successfully', null, null);
        })
        .catch(async (err) => {
            await removeFile(`./public${album.background}`);
            return responsehandler(res, 400, err, null, null);
        });
}

exports.updateAlbum = async function (req, res) {
    let id = req.params.albumId;
    let album = await Album.findById(id);
    let oldBackground = album.background;
    let oldSingers = album.singers;
    let { albumname, description, singers } = req.body;
    album.albumname = albumname;
    album.description = description;
    album.singers = singers;
    album.namenosign = removeVietnameseTones(album.albumname);
    let background = req.files?.background;
    if (background) {
        let path = await saveImage(background);
        album.background = path;
    }
    await album.save()
        .then(async () => {
            await removeFile(`./public${oldBackground}`);
            oldSingers.forEach(async element => {
                let singer = await Singer.findOne({ _id: element._id });
                singer.albums.pull(album._id);
                await singer.save();
            });
            album.singers.forEach(async element => {
                let singer = await Singer.findOne({ _id: element._id });
                singer.albums.push(album._id);
                await singer.save();
            });
            return responsehandler(res, 200, 'Successfully', null, null);
        })
        .catch(async (err) => {
            await removeFile(`./public${album.background}`);
            return responsehandler(res, 400, err, null, null);
        });
}

exports.detailAlbum = async function (req, res) {
    let album_id = req.params.albumId;
    let album = await Album.findOne({
        _id: album_id
    }, ['_id', 'total', 'albumname', 'description', 'background', 'tracks', 'singers'])
        .populate('singers', ['_id', 'name'])
        .populate('tracks', ['_id', 'total', 'tracklink', 'trackname', 'description', 'background']);
    album.tracks.forEach(function (item) {
        item.tracklink = '/tracks/play/' + item._id;
    });
    return responsehandler(res, 200, 'Successfully', album, null);
}

exports.topAlbum = async function (req, res) {
    return responsehandler(res, 200, 'Chưa đủ dữ liệu để làm!', null, null);
}

exports.delete = async function (req, res) {
    let albumId = req.params.albumId;
    let album = await Album.findByIdAndDelete(albumId);
    const tracks = await Track.find({ album: album._id });
    tracks.forEach(async track => {
        track.album = null;
        await track.save();
    })
    album.singers.forEach(async element => {
        let singer = await Singer.findOne({ _id: element });
        singer.albums.pull(element);
        await singer.save();
    });
    responsehandler(res, 200, 'Successfully', null, null);
}

exports.listAlbum = async function (req, res) {
    var options = {
        select: '_id albumname description background createdAt updatedAt',
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        // populate: { path: 'singer tracktype', select: '_id name avatar typename' },
    };
    if (req.query?.keyword) {
        let keyword = removeVietnameseTones(req.query.keyword);
        var query = {
            namenosign: { $regex: '.*' + keyword + '.*' },
        };
        var listAlbum = await Album.paginate(query, options);
    } else {
        var listAlbum = await Album.paginate({}, options);
    }

    var meta = buildMetaHandler(listAlbum);
    return responsehandler(res, 200, 'Successfully', listAlbum.docs, meta);
}

// exports.detail = async function (req, res, next) {
//     let album_id = req.params.albumID;
//     let album = await Album.findOne({ _id: album_id }, ['_id', 'total', 'albumname', 'description', 'background', 'tracks']);
//     album.total += 1;
//     await album.save();
//     let tracks = await Track.find({}, ['_id', 'total', 'tracklink', 'trackname', 'description', 'background']).where('_id').in(album._doc.tracks);
//     tracks.forEach(function (item) {
//         item._doc.tracklink = process.env.ENVIROMENT + '/tracks/play/' + item._doc._id;
//     });
//     album.tracks = tracks;
//     return responsehandler(res, 200, 'Successfully', album, null);
// }


// exports.addtracktoalbum = async function (req, res, next) {
//     let tracks = req.body.tracks;
//     let album_id = req.body.album_id;
//     let album = await Album.findById(album_id);
//     tracks.forEach(element => {
//         album.tracks.push(element);
//         Track.findById({ _id: element })
//             .then(track => {
//                 track.album_id = album_id;
//                 track.save()
//             })
//     });
//     await album.save();
//     return responsehandler(res, 200, 'Successfully', null, null);
// }

// exports.topalbum = async function (req, res, next) {
//     let albums = await Album.find({}, ['_id', 'total', 'albumname', 'description', 'background'])
//         .sort({ total: -1 }).limit(15);
//     return responsehandler(res, 200, 'Successfully', albums, null);
// }

// exports.movetracktoalbum = async function (req, res, next) {
//     let track_id = req.body.track_id;
//     let album_id = req.body.album_id;
//     let album = await Album.findById(album_id);
//     album.tracks.pull(track_id);
//     await album.save();
//     return responsehandler(res, 200, 'Successfully', null, null);
// }

// exports.find = async function (req, res, next) {
//     let keyword = removeVietnameseTones(req.body.trackname);
//     let albums = await Album.find({ namenosign: { $regex: '.*' + keyword + '.*' } }, ['_id', 'total', 'albumname', 'description', 'background'])
//     return responsehandler(res, 200, 'Successfully', albums, null);
// }