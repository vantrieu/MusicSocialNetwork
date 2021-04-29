const saveMusic = async function (music) {
    if (music.mimetype != 'audio/mpeg') {
        return null;
    } else {
        let time = Math.floor(Date.now() / 1000).toString();
        let address = './musics/' + time + music.name;
        await music.mv(address);
        return address;
    }
}

module.exports = saveMusic;