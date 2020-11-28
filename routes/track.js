const router = require("express-promise-router")();
const AuthUser = require('../middlewares/authUser');
const TrackController = require('../controllers/track.controller');

router.post('/create-track', AuthUser,  TrackController.createTrack);
router.get("/play/:trackID", AuthUser, TrackController.playmusic);
router.get('/my-music', AuthUser, TrackController.listmusic);

module.exports = router;