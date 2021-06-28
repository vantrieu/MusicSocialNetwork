const responsehandler = require('../helpers/respone-handler');
const removeVietnameseTones = require('../helpers/convertVie-handler');
const Album = require('../models/Album');
const Track = require('../models/Track');
const Singer = require('../models/Singer');

exports.find = async function (req, res) {
    let limit = parseInt(req.query.limit) || 3;
    keyword = removeVietnameseTones(req.query.keyword);
    let tracks = await Track.find(
        { namenosign: { $regex: '.*' + keyword + '.*' } },
        ['_id', 'total', 'tracklink', 'trackname', 'description', 'background', 'singer', 'tracktype', 'album'])
        .populate('album', ['_id', 'albumname', 'background', 'description']).limit(limit);
    tracks.forEach(function (item) {
        item._doc.tracklink = '/tracks/play/' + item._doc._id;
    })
    let albums = await Album.find(
        { namenosign: { $regex: '.*' + keyword + '.*' } },
        ['_id', 'albumname', 'background', 'description']).limit(limit);
    let singers = await Singer.find(
        { namenosign: { $regex: '.*' + keyword + '.*' } },
        ['_id', 'name', 'description', 'avatar']).limit(limit);
    return responsehandler(res, 200, 'Successfully', {tracks, albums, singers}, null);
}