const router = require("express-promise-router")();
const authModer = require('../middlewares/authModer');
const PlaylistController = require('../controllers/playlist.controller');
const { validateAuth } = require('../helpers/validator-handler');
const authUser = require('../middlewares/authUser');

router.post('/create-playlist', validateAuth, authUser, PlaylistController.createPlaylist);
router.post('/add-track', validateAuth, authUser, PlaylistController.addTrackToPlaylist);
router.get('/detail/:ID', validateAuth, authUser, PlaylistController.detailPlaylist);
router.delete('/delete/:ID', validateAuth, authUser, PlaylistController.delete);
router.post('/remove-track', validateAuth, authUser, PlaylistController.removeTrack);
// router.post('/delete/:playlistID', validateAuth, authModer, PlaylistController.delete);
router.get('/', validateAuth, authUser, PlaylistController.listPlaylist);

module.exports = router;