// const express = require('express');
const authAdmin = require('../middlewares/authAdmin');
const authUser = require('../middlewares/authUser');
const authRefreshToken = require('../middlewares/authResfreshToken');
const authResetPass = require('../middlewares/authResetPass');
const authModer = require('../middlewares/authModer');
const accountController = require('../controllers/account.controller');
const { validateRegister } = require('../helpers/validator-handler');

var router = require("express-promise-router")();

router.post('/login', accountController.login);
router.post('/refresh-token', authRefreshToken, accountController.refreshtoken);
router.post('/forgot-password', accountController.fortgotpassword);
router.post('/reset/:token', authResetPass, accountController.resetpassword);
router.post('/change-password', authUser, accountController.changepassword);
router.post('/register-account', validateRegister, accountController.registeraccount);
router.post('/register-moderator', authAdmin, validateRegister, accountController.registermoderator);
router.get('/list-account', authModer, accountController.getlistaccount);
router.get('/list-moderator', authModer, accountController.getlistmoderator);
router.get('/find/:username', authUser, accountController.findAccount);
router.post('/lock-account', authModer, accountController.lockaccount);
router.post('/unlock-account', authModer, accountController.unlockaccount);
router.post('/login-facebook', accountController.loginFacebook);
router.post('/login-google', accountController.loginGoogle);
router.post('/delete-moderator', authAdmin, accountController.deleteModerator);

module.exports = router;