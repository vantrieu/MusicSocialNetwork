const authModer = require('../middlewares/authModer');
const albumController = require('../controllers/album.controller');
const { validateAuth } = require('../helpers/validator-handler');

var router = require("express-promise-router")();

router.post('/', validateAuth, authModer, albumController.createAlbum);
router.put('/:albumId', validateAuth, authModer, albumController.updateAlbum);
router.get('/detail/:albumId', albumController.detailAlbum);
router.get('/top-trend', albumController.topAlbum);
router.delete('/delete/:albumId', albumController.delete);

module.exports = router;