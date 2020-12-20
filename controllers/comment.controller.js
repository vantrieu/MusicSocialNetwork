const responsehandler = require('../helpers/respone-handler');
const removeVietnameseTones = require('../helpers/convertVie-handler');
const moment = require('moment');
const Track = require('../models/Track');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Reply = require('../models/Reply');

exports.createComment = async function (req, res, next) {
    const user_id = res.locals.account.user_id;
    let comment = new Comment(req.body);
    comment.user = user_id;
    var track = await Track.findById(req.body.track_id);
    track.comments.push(comment._id);
    await track.save();
    await comment.save();
    return responsehandler(res, 200, 'Successfully', null, null);
}

exports.deleteComment = async function (req, res) {
    const comment_id = req.params.commentID;
    const user_id = res.locals.account.user_id;
    const comment = await Comment.findById(comment_id);
    if (user_id != comment.user) {
        return responsehandler(res, 401, 'Not authorized to access this resource', null, null);
    }
    if(comment !== null){
        for (const item of comment._doc.replys) {
            await Reply.deleteOne({ _id: item });
        }
        var track = await Track.findById(comment.track_id);
        if (track._doc.comments.length !== 0) {
            track._doc.comments.pull(comment_id);
            await track.save();
        }
        await Comment.deleteOne({_id: comment_id});
    }
    return responsehandler(res, 200, 'Successfully', null, null);
}

exports.deleteReply = async function (req, res) {
    const reply_id = req.params.replyID;
    const user_id = res.locals.account.user_id;
    const reply = await Reply.findById(reply_id);
    if (user_id != reply.user) {
        return responsehandler(res, 401, 'Not authorized to access this resource', null, null);
    }
    if (reply !== null) {
        var comment = await Comment.findById(reply.comment_id);
        if (comment.replys.length !== 0) {
            comment.replys.pull(reply_id);
            await comment.save();
        }
        await Reply.deleteOne({ _id: reply_id })
    }
    return responsehandler(res, 200, 'Successfully', null, null);
}

exports.editComment = async function (req, res) {
    const comment_id = req.params.commentID;
    const user_id = res.locals.account.user_id;
    const comment = await Comment.findById(comment_id);
    if (user_id != comment.user) {
        return responsehandler(res, 401, 'Not authorized to access this resource', null, null);
    }
    if(comment !== null) {
        var content = req.body.comment;
        comment.comment = content;
        await comment.save();
    }
    return responsehandler(res, 200, 'Successfully', null, null);
}

exports.editReply = async function (req, res) {
    const reply_id = req.params.replyID;
    const user_id = res.locals.account.user_id;
    const reply = await Reply.findById(reply_id);
    if (user_id != reply.user) {
        return responsehandler(res, 401, 'Not authorized to access this resource', null, null);
    }
    if(reply !== null) {
        var content = req.body.comment;
        reply.comment = content;
        await reply.save();
    }
    return responsehandler(res, 200, 'Successfully', null, null);
}

exports.getListComment = async function (req, res) {
    const track_id = req.params.trackID;
    var comments = await Comment.find({ track_id: track_id }, ['_id', 'comment', 'createdAt', 'updatedAt', 'user', 'replys'])
        .populate('user', ['_id', 'avatar', 'firstname', 'lastname'])
        .populate('replys', ['_id', 'comment', 'user', 'createdAt', 'updatedAt']);
    for (let comment of comments) {
        comment._doc.createdAt = moment(comment._doc.createdAt).format('DD/MM/YYYY HH:mm');
        comment._doc.updatedAt = moment(comment._doc.updatedAt).format('DD/MM/YYYY HH:mm');
        for (let item of comment._doc.replys) {
            item._doc.createdAt = moment(item._doc.createdAt).format('DD/MM/YYYY HH:mm');
            item._doc.updatedAt = moment(item._doc.updatedAt).format('DD/MM/YYYY HH:mm');
            var temp = await User.findById(item._doc.user, ['_id', 'avatar', 'firstname', 'lastname']);
            temp._doc.avatar = process.env.ENVIROMENT + temp._doc.avatar;
            item._doc.user = temp;
        }
        comment._doc.replys = comment._doc.replys;
        comment._doc.user.avatar = process.env.ENVIROMENT + comment._doc.user.avatar.replace(process.env.ENVIROMENT, '');
    }
    return responsehandler(res, 200, 'Successfully', comments, null);
}

exports.replyComment = async function (req, res) {
    const user_id = res.locals.account.user_id;
    var reply = new Reply(req.body);
    reply.user = user_id;
    const comment_id = req.params.commentID;
    reply.comment_id = comment_id;
    const comment = await Comment.findById(req.params.commentID);
    comment.replys.push(reply._id);
    await comment.save();
    await reply.save();
    return responsehandler(res, 200, 'Successfully', null, null);
}
