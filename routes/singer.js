const authModer = require('../middlewares/authModer');
const singerController = require('../controllers/singer.controller');

var router = require("express-promise-router")();

router.get('/', singerController.getList);
router.get('/:id', singerController.getByID);
router.post('/', authModer, singerController.create);
router.put ('/:id', authModer, singerController.update);

module.exports = router;