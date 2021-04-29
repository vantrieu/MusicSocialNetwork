const saveImage = async function (image) {
    if (image.mimetype == 'image/jpeg' || image.mimetype == 'image/png') {
        let address = '/images/' + Math.floor(Date.now() / 1000).toString() + image.name;
        await image.mv('./public' + address);
        return address;
    } else {
        return null;
    }
}

module.exports = saveImage;