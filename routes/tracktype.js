const authUser = require('../middlewares/authUser');
const authModer = require('../middlewares/authModer');
const TrackTypeController = require('../controllers/tracktype.controller');
const { validateAuth } = require('../helpers/validator-handler');

const router = require("express-promise-router")();

router.get('/list-type', TrackTypeController.getlist);
router.get('/type', TrackTypeController.getone);
router.get('/option', TrackTypeController.getListOption);
router.get('/:trackTypeId/get-singer', TrackTypeController.getSingerOfType);
router.get('/:trackTypeId/get-tracks', TrackTypeController.getTrackOfType);
router.post('/create', validateAuth, authModer, TrackTypeController.create);
router.post('/delete/:typeID', validateAuth, authModer, TrackTypeController.delete);
router.post('/update/:typeID', validateAuth, authModer, TrackTypeController.modify);
module.exports = router;