const router = require("express-promise-router")();
const AuthUser = require('../middlewares/authUser');
const HistoryController = require('../controllers/history.controller');


router.get('/get-hisory', AuthUser, HistoryController.viewHistory);

module.exports = router;