const router = require("express-promise-router")();
const authUser = require('../middlewares/authUser');
const PlaylistController = require('../controllers/playlist.controller');
const { validateAuth } = require('../helpers/validator-handler');

router.post('/create-playlist', validateAuth, authUser, PlaylistController.createPlaylist);
router.post('/add-track', validateAuth, authUser, PlaylistController.addTrackToPlaylist);
router.get('/detail/:ID', validateAuth, authUser, PlaylistController.detailPlaylist);
router.post('/delete/:ID', validateAuth, authUser, PlaylistController.delete);
router.post('/remove-track', validateAuth, authUser, PlaylistController.removeTrack);
router.post('/delete/:playlistID', validateAuth, authUser, PlaylistController.delete);

module.exports = router;