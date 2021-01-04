const router = require("express-promise-router")();
const AuthUser = require('../middlewares/authUser');
const HistoryController = require('../controllers/history.controller');
const { validateAuth } = require('../helpers/validator-handler');


router.get('/get-hisory', validateAuth, AuthUser, HistoryController.viewHistory);

module.exports = router;