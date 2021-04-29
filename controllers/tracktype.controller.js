const moment = require('moment');
const responsehandler = require('../helpers/respone-handler');
const TrackType = require('../models/TrackType');

exports.create = async function (req, res) {
    let tracktype = new TrackType(req.body);
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
    let tracktypes = await TrackType.find({ isDelete: { "$ne": 1 } }, ['_id', 'typename', 'createdAt', 'updatedAt']);
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
