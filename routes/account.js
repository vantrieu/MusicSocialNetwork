const express = require('express');
const authAdmin = require('../middlewares/authAdmin');
const authUser = require('../middlewares/authUser');
const authRefreshToken = require('../middlewares/authResfreshToken');
const authResetPass = require('../middlewares/authResetPass');
const authModer = require('../middlewares/authModer');
const accountController = require('../controllers/account.controller');
const {validateBody, schemas} = require('../helpers/validate-handler');

//const router = express.Router();
var router = require("express-promise-router")();

router.post('/login', accountController.login);
router.post('/refresh-token', authRefreshToken, accountController.refreshtoken);
router.post('/forgot-password', accountController.fortgotpassword);
router.post('/reset/:token',authResetPass, accountController.resetpassword);
router.post('/change-password', authUser, accountController.changepassword);
router.post('/register-account', validateBody(schemas.accountSchema), accountController.registeraccount);
router.post('/register-moderator', authAdmin, accountController.registermoderator);
router.get('/list-account', authModer, accountController.getlistaccount);
router.get('/list-moderator', authModer, accountController.getlistmoderator);
router.get('/find/:username', authUser, accountController.findAccount);
router.post('/lock-account', authModer, accountController.lockaccount);
router.post('/unlock-account', authModer, accountController.unlockaccount);


module.exports = router;