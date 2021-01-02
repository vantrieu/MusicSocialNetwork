const router = require("express-promise-router")();
const AuthUser = require('../middlewares/authUser');
const TrackController = require('../controllers/track.controller');
const authUser = require("../middlewares/authUser");

router.post('/create-track', AuthUser, TrackController.createTrack);
router.get('/play/:trackID/:userID', TrackController.playmusic);
router.get('/top-music', AuthUser, TrackController.topmusic);
router.get('/find', authUser, TrackController.findbyname);
router.get('/download/:trackname', TrackController.downloadFile);

module.exports = router;