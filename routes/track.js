const router = require("express-promise-router")();
const AuthUser = require('../middlewares/authUser');
const TrackController = require('../controllers/track.controller');
const {validateParam, schemas} = require('../helpers/validate-handler');
const authUser = require("../middlewares/authUser");

router.post('/create-track', AuthUser, TrackController.createTrack);
router.get('/play/:trackID', validateParam(schemas.idSchema, 'trackID'), TrackController.playmusic);
router.get('/top-music', AuthUser, TrackController.topmusic);
router.get('/find', authUser, TrackController.findbyname);

module.exports = router;