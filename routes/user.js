const express = require('express');
const authUser = require('../middlewares/authUser');
const userController = require('../controllers/user.controller');
const multer  = require('multer');
const path = require('path');

// const router = express.Router();
const router = require("express-promise-router")();

router.get('/me', authUser, userController.me);
router.post('/changeavatar', authUser, userController.uploadimg);
router.post('/update-profile', authUser, userController.changeprofile);
router.post('/follow-user', authUser, userController.createfollow);
router.get('/get-follow-me', authUser, userController.getfollowme);
router.get('/get-follow-by-me', authUser, userController.getfollowbyme);
router.post('/unfollow', authUser, userController.unfollow);
router.get('/my-music', authUser, userController.mymusic);
// router.post('/upload', authUser, userController.uploadmp3);
// router.post('/geturlforgot', userController.geturlforgot);
// router.post('/reset/:token', userController.resetpassword);

module.exports = router;