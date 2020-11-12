const express = require('express');
const authAdmin = require('../middlewares/authAdmin');
const authUser = require('../middlewares/authUser');
const authRefreshToken = require('../middlewares/authResfreshToken');
const authResetPass = require('../middlewares/authResetPass')
const accountController = require('../controllers/account.controller');

const router = express.Router();

router.post('/create-user', accountController.createuser);
router.post('/create-moderator', authAdmin, accountController.createmoderator);
router.post('/login', accountController.login);
router.post('/refresh-token', authRefreshToken, accountController.refreshtoken);
router.post('/forgot-password', accountController.fortgotpassword);
router.post('/reset/:token',authResetPass, accountController.resetpassword);
router.post('/change-password', authUser, accountController.changepassword);

module.exports = router;