const moment = require('moment');
const responsehandler = require('../helpers/respone-handler');
const TrackType = require('../models/TrackType');
const Track = require('../models/Track');
const Singer = require('../models/Singer');
const saveImage = require('../services/save-images');
const removeFile = require('../services/remove-files');
const buildMetaHandler = require('../helpers/build-meta-handler');

exports.create = async function (req, res) {
    let tracktype = new TrackType(req.body);
    let background = req.files?.background;
    if (background) {
        let path = await saveImage(background);
        tracktype.background = path;
    }
    await tracktype.save();
    tracktype._doc.createdAt = moment(tracktype._doc.createdAt).format('DD/MM/YYYY');
    let { __v, updatedAt, isDelete, ...typeNoField } = tracktype._doc;
    return responsehandler(res, 201, 'Successfully', { ...typeNoField }, null);
}

exports.delete = async function (req, res) {
    let { typeID } = req.params;
    let tracktype = await TrackType.findOne({ _id: typeID }, ['_id', 'typename', 'createdAt', 'updatedAt']);
    tracktype.isDelete = 1;
    await tracktype.save();
    tracktype._doc.createdAt = moment(tracktype._doc.createdAt).format('DD/MM/YYYY');
    tracktype._doc.updatedAt = moment(tracktype._doc.updatedAt).format('DD/MM/YYYY');
    responsehandler(res, 200, 'Successfully', tracktype, null);
}

exports.getlist = async function (req, res) {
    let tracktypes = await TrackType.find({ isDelete: { "$ne": 1 } }, ['_id', 'typename', 'background', 'createdAt', 'updatedAt']);
    tracktypes.forEach(function (item) {
        item._doc.createdAt = moment(item._doc.createdAt).format('DD/MM/YYYY');
        item._doc.updatedAt = moment(item._doc.updatedAt).format('DD/MM/YYYY');
    })
    responsehandler(res, 200, 'Successfully', tracktypes, null);
}

exports.getone = async function (req, res) {
    let typeID = req.body.tracktype_id;
    let tracktype = await TrackType.findOne({ isDelete: { "$ne": 1 }, _id: typeID }, ['_id', 'typename', 'createdAt']);
    tracktype._doc.createdAt = moment(tracktype._doc.createdAt).format('DD/MM/YYYY');
    responsehandler(res, 200, 'Successfully', tracktype, null);
}

exports.modify = async function (req, res) {
    let { typeID } = req.params;
    let body = req.body;
    await TrackType.updateOne({ _id: typeID }, { $set: body });
    let tracktype = await TrackType.findOne({ _id: typeID }, ['_id', 'typename', 'createdAt', 'updatedAt']);
    tracktype._doc.createdAt = moment(tracktype._doc.createdAt).format('DD/MM/YYYY');
    tracktype._doc.updatedAt = moment(tracktype._doc.updatedAt).format('DD/MM/YYYY');
    responsehandler(res, 200, 'Successfully', tracktype, null);
}

exports.getListOption = async function (req, res) {
    let tracktypes = await TrackType.find({ isDelete: { "$ne": 1 } }, ['_id', 'typename']);
    responsehandler(res, 200, 'Successfully', tracktypes, null);
}

exports.getSingerOfType = async function (req, res) {
    let { trackTypeId } = req.params;
    let singerIds = await Track.find({ tracktype: trackTypeId }, ['singer']).distinct('singer');
    let singers = await Singer.find({ '_id': { $in: singerIds } }, ['_id', 'name', 'avatar', 'createdAt', 'updatedAt']);
    responsehandler(res, 200, 'Successfully', singers, null);
}

exports.getTrackOfType = async function (req, res) {
    let { trackTypeId } = req.params;
    var options = {
        select: '_id total tracklink trackname description background singer',
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 30,
        populate: { path: 'singer', select: '_id name avatar' },
    };
    var query = {
        tracktype: trackTypeId
    };
    const listTrack = await Track.paginate(query, options);

    listTrack.docs.forEach(function (item) {
        item._doc.tracklink = '/tracks/play/' + item._doc._id;
    })
    var meta = buildMetaHandler(listTrack);
    return responsehandler(res, 200, 'Successfully', listTrack.docs, meta);
}

exports.getTopTrackTypes = async function (req, res) {
    let tracktypeIds = await Track.find({}, ['tracktype']).sort({ total: -1}).limit(50).distinct('tracktype');
    let tracktypes = await TrackType.find({ '_id': { $in: tracktypeIds } }, ['_id', 'typename', 'background', 'createdAt', 'updatedAt']);
    return responsehandler(res, 200, 'Successfully', tracktypes, null);
}