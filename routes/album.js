const router = require("express-promise-router")();
const AuthUser = require('../middlewares/authUser');
const AlbumController = require('../controllers/album.controller');
const authUser = require("../middlewares/authUser");

router.post('/create-album', AuthUser, AlbumController.createalbum);
router.post('/add-track', authUser, AlbumController.addtracktoalbum);
router.get('/detail/:albumID', authUser, AlbumController.detail);
router.get('/top-album', authUser, AlbumController.topalbum);
router.post('/remove-track', authUser, AlbumController.movetracktoalbum);
router.get('/find', authUser, AlbumController.find);
router.post('/delete/albumID', authUser, AlbumController.delete);

module.exports = router;