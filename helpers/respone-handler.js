const responeHandler = function (res, status, message, items, meta) {
    if(meta !== null) {
        return res.status(200).json({
            'items': items,
            'meta': meta,
            'message': message,
            'status': status
        });
    } else {
        return res.status(200).json({
            'items': items,
            'message': message,
            'status': status
        });
    }
}

module.exports = responeHandler