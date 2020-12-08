const router = require("express-promise-router")();
const AuthUser = require('../middlewares/authUser');
const AlbumController = require('../controllers/album.controller');
const authUser = require("../middlewares/authUser");

router.post('/create-album', AuthUser, AlbumController.createalbum);
router.post('/add-track', authUser, AlbumController.addtracktoalbum);
router.get('/detail/:albumID', authUser, AlbumController.detail);

module.exports = router;