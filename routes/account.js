const express = require('express');
const authAdmin = require('../middlewares/authAdmin');
const authUser = require('../middlewares/authUser');
const authRefreshToken = require('../middlewares/authResfreshToken');
const accountController = require('../controllers/account.controller');

const router = express.Router();

router.post('/create-user', accountController.createuser);
router.post('/create-moderator', authAdmin, accountController.createmoderator);
router.post('/login', accountController.login);
router.post('/refresh-token', authRefreshToken, accountController.refreshtoken);

module.exports = router;