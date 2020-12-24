const responeHandler = function (res, status, message, items, meta) {
    if(meta !== null) {
        return res.status(status).json({
            'items': items,
            'meta': meta,
            'message': message
        });
    } else {
        return res.status(status).json({
            'items': items,
            'message': message
        });
    }
}

module.exports = responeHandler