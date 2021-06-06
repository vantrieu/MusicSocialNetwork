// const express = require('express');
const authAdmin = require('../middlewares/authAdmin');
const authUser = require('../middlewares/authUser');
const authRefreshToken = require('../middlewares/authResfreshToken');
const authResetPass = require('../middlewares/authResetPass');
const authModer = require('../middlewares/authModer');
const accountController = require('../controllers/account.controller');
const { validateRegister, validateLogin, validateAuthRefresh, validateAuth } = require('../helpers/validator-handler');

var router = require("express-promise-router")();

router.post('/login', validateLogin, accountController.login);
router.post('/refresh-token', validateAuthRefresh, authRefreshToken, accountController.refreshtoken);
router.post('/forgot-password', accountController.fortgotpassword);
router.post('/reset/:token', authResetPass, accountController.resetpassword);
router.post('/change-password', validateAuth, authUser, accountController.changepassword);
router.post('/register-account', validateRegister, accountController.registeraccount);
router.post('/register-moderator', validateAuth, authAdmin, validateRegister, accountController.registermoderator);
router.get('/list-account', validateAuth, authModer, accountController.getlistaccount);
router.get('/list-moderator', validateAuth, authModer, accountController.getlistmoderator);
router.get('/find/:username', validateAuth, authUser, accountController.findAccount);
router.post('/lock-account', validateAuth, authModer, accountController.lockaccount);
router.post('/un-lock-account', validateAuth, authModer, accountController.unlockaccount);
router.post('/login-facebook', accountController.loginFacebook);
router.post('/login-google', accountController.loginGoogle);
router.post('/delete-moderator', validateAuth, authAdmin, accountController.deleteModerator);

module.exports = router;