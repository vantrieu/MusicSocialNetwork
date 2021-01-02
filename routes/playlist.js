const router = require("express-promise-router")();
const authUser = require('../middlewares/authUser');
const PlaylistController = require('../controllers/playlist.controller');

router.post('/create-playlist', authUser, PlaylistController.createPlaylist);
router.post('/add-track', authUser, PlaylistController.addTrackToPlaylist);
router.get('/detail/:ID', authUser, PlaylistController.detailPlaylist);
router.post('/delete/:ID', authUser, PlaylistController.delete);
router.post('/remove-track', authUser, PlaylistController.removeTrack);
router.post('/delete/:playlistID', authUser, PlaylistController.delete);

module.exports = router;