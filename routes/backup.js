const authModer = require('../middlewares/authModer');
const backupController = require('../controllers/backup.controller');

var router = require("express-promise-router")();

router.post('/', authModer, backupController.backupDatabase);

module.exports = router;