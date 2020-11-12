const express = require('express');
const authUser = require('../middlewares/authUser');
const userController = require('../controllers/user.controller');
const multer  = require('multer');
const path = require('path');

const router = express.Router();

router.get('/me', authUser, userController.me);
router.post('/changeavatar', authUser, userController.uploadimg);
// router.get('/otp', userController.getotp);
// router.post('/upload', authUser, userController.uploadmp3);
// router.post('/geturlforgot', userController.geturlforgot);
// router.post('/reset/:token', userController.resetpassword);

module.exports = router;