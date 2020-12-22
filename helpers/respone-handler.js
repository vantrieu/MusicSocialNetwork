const responeHandler = function (res, status, message, items) {
    return res.status(status).json({
        'data': items,
        'message': message
    });
}

module.exports = responeHandler