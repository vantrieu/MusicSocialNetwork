const router = require("express-promise-router")();
const AuthUser = require('../middlewares/authUser');
const TrackController = require('../controllers/track.controller');
const authUser = require("../middlewares/authUser");
const { validateAuth } = require('../helpers/validator-handler');

router.post('/create-track', validateAuth, AuthUser, TrackController.createTrack);
router.get('/play/:trackID/:userID', TrackController.playmusic);
router.get('/top-music', validateAuth, AuthUser, TrackController.topmusic);
router.get('/find', validateAuth, authUser, TrackController.findbyname);
router.get('/download/:trackname', TrackController.downloadFile);

module.exports = router;