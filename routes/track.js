const router = require("express-promise-router")();
const AuthUser = require('../middlewares/authUser');
const TrackController = require('../controllers/track.controller');
const {validateParam, schemas} = require('../helpers/validate-handler');

router.post('/create-track', AuthUser,  TrackController.createTrack);
router.get("/play/:trackID", validateParam(schemas.idSchema, 'trackID'), AuthUser, TrackController.playmusic);
router.get('/my-music', AuthUser, TrackController.listmusic);

module.exports = router;