const authModer = require('../middlewares/authModer');
const albumController = require('../controllers/album.controller');
const getCurrentUser = require('../middlewares/getCurrentUser');
const { validateAuth } = require('../helpers/validator-handler');

var router = require("express-promise-router")();

router.put('/remove-track', validateAuth, authModer, albumController.movetracktoalbum);
router.post('/', validateAuth, authModer, albumController.createAlbum);
router.put('/:albumId', validateAuth, authModer, albumController.updateAlbum);
router.get('/detail/:albumId', getCurrentUser, albumController.detailAlbum);
router.get('/top-trend', albumController.topAlbum);
router.get('/', albumController.listAlbum);
router.delete('/delete/:albumId', validateAuth, authModer, albumController.delete);
router.post('/add-track', validateAuth, authModer, albumController.addtracktoalbum);

module.exports = router;