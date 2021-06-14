const Album = require("../models/Album");
const Track = require('../models/Track');

exports.CalculatorAlbum = async function (err, account) {
    let albums = await Album.find();
    for (let i = 0; i < albums.length; i++) {
        var totalListen = 0;
        album = albums[i];
        for (let j = 0; j < album.tracks.length; j++) {
            let track = await Track.findById(album.tracks[j]);
            totalListen += track.total;
        }
        album.total = totalListen;
        await album.save();
    }
}