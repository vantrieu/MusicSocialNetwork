const express = require('express');
const authAdmin = require('../middlewares/authAdmin');
const authUser = require('../middlewares/authUser');
const authRefreshToken = require('../middlewares/authResfreshToken');
const authResetPass = require('../middlewares/authResetPass');
const authModer = require('../middlewares/authModer');
const accountController = require('../controllers/account.controller');

//const router = express.Router();
var router = require("express-promise-router")();

router.post('/login', accountController.login);
router.post('/refresh-token', authRefreshToken, accountController.refreshtoken);
router.post('/forgot-password', accountController.fortgotpassword);
router.post('/reset/:token',authResetPass, accountController.resetpassword);
router.post('/change-password', authUser, accountController.changepassword);
router.post('/register-account', accountController.registeraccount);
router.post('/register-moderator', authAdmin, accountController.registermoderator);
router.get('/list-account-active', authModer, accountController.getlistaccountactive);
router.get('/list-moderator-active', authModer, accountController.getlistmoderatoractive);
router.get('/list-account-lock', authModer, accountController.getlistaccountlock);
router.get('/list-moderator-lock', authModer, accountController.getlistmoderatorlock);
router.post('/lock-user', authModer, accountController.lockaccount);
router.post('/unlock-user', authModer, accountController.unlockaccount);


module.exports = router;