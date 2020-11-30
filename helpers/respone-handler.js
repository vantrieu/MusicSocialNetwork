const responeHandler = function (res, status, message, items, meta) {
    return res.status(status).json({
        'data': {
            'items': items,
            'meta': meta
        },
        'message': message
    });
}

module.exports = responeHandler