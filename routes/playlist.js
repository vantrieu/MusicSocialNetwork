const router = require("express-promise-router")();
const authModer = require('../middlewares/authModer');
const PlaylistController = require('../controllers/playlist.controller');
const { validateAuth } = require('../helpers/validator-handler');

router.post('/create-playlist', validateAuth, authModer, PlaylistController.createPlaylist);
router.post('/add-track', validateAuth, authModer, PlaylistController.addTrackToPlaylist);
router.get('/detail/:ID', PlaylistController.detailPlaylist);
router.post('/delete/:ID', validateAuth, authModer, PlaylistController.delete);
router.post('/remove-track', validateAuth, authModer, PlaylistController.removeTrack);
router.post('/delete/:playlistID', validateAuth, authModer, PlaylistController.delete);
router.get('/', PlaylistController.listPlaylist);

module.exports = router;