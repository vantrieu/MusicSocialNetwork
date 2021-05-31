const router = require("express-promise-router")();
const AuthUser = require('../middlewares/authUser');
const TrackController = require('../controllers/track.controller');
const { validateAuth } = require('../helpers/validator-handler');

router.post('/create-track', validateAuth, AuthUser, TrackController.createTrack);
router.post('/update-track/:trackID', validateAuth, AuthUser, TrackController.updateTrack);
router.get('/play/:trackID/:userID', TrackController.playmusicPrivate);
router.delete('/delete/:trackID', validateAuth, AuthUser, TrackController.deleteTrack);
router.get('/play/:trackID', TrackController.playmusicPublic);
router.get('/top-music', TrackController.topmusic);
router.get('/list-music', TrackController.listmusic);
router.get('/option-music/:trackID', TrackController.optionMusic);
router.get('/option/:trackID', TrackController.optionAlbum);
router.get('/find', TrackController.findbyname);
router.get('/download/:trackname', TrackController.downloadFile);

module.exports = router;