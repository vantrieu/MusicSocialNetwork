const express = require('express');
const authUser = require('../middlewares/authUser');
const userController = require('../controllers/user.controller');
const multer  = require('multer');
const path = require('path');

const router = express.Router();

router.post('/create', userController.create);
router.post('/login', userController.login);
router.get('/me', authUser, userController.me);
router.post('/me/logout', authUser, userController.logout);
router.post('/me/logoutall', authUser, userController.logoutall);
router.post('/me/changeavatar', authUser, userController.uploadimg);
router.get('/otp', userController.getotp);
router.post('/upload', authUser, userController.uploadmp3);
router.post('/geturlforgot', userController.geturlforgot);
router.post('/reset/:token', userController.resetpassword);

module.exports = router;