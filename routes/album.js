const router = require("express-promise-router")();
const AuthUser = require('../middlewares/authUser');
const AlbumController = require('../controllers/album.controller');
const authUser = require("../middlewares/authUser");
const { validateAuth } = require('../helpers/validator-handler');

router.post('/create-album', validateAuth, AuthUser, AlbumController.createalbum);
router.post('/add-track', validateAuth, authUser, AlbumController.addtracktoalbum);
router.get('/detail/:albumID', validateAuth, authUser, AlbumController.detail);
router.get('/top-album', validateAuth, authUser, AlbumController.topalbum);
router.post('/remove-track', validateAuth, authUser, AlbumController.movetracktoalbum);
router.get('/find', validateAuth, authUser, AlbumController.find);
router.post('/delete/albumID', validateAuth, authUser, AlbumController.delete);

module.exports = router;