const express = require('express');
const authAdmin = require('../middlewares/authAdmin');
const authUser = require('../middlewares/authUser');
const authRefreshToken = require('../middlewares/authResfreshToken');
const authResetPass = require('../middlewares/authResetPass');
const authModer = require('../middlewares/authModer');
const accountController = require('../controllers/account.controller');

const router = express.Router();

router.post('/login', accountController.login);
router.post('/refresh-token', authRefreshToken, accountController.refreshtoken);
router.post('/forgot-password', accountController.fortgotpassword);
router.post('/reset/:token',authResetPass, accountController.resetpassword);
router.post('/change-password', authUser, accountController.changepassword);
router.post('/register-account', accountController.registeraccount);
router.post('/register-moderator', authAdmin, accountController.registermoderator);
router.get('/list-account', authModer, accountController.getlistaccount);
router.get('/list-moderator', authModer, accountController.getlistmoderator);

module.exports = router;