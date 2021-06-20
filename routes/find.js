const router = require("express-promise-router")();
const FindController = require('../controllers/find.controller');

router.get('/', FindController.find);

module.exports = router;