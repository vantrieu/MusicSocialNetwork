//const express = require('express');
const authUser = require('../middlewares/authUser');
const userController = require('../controllers/user.controller');
//const multer  = require('multer');
//const path = require('path');

const router = require("express-promise-router")();

router.get('/my-profile', authUser, userController.me);
router.get('/view-profile', authUser, userController.viewProfile);
router.post('/changeavatar', authUser, userController.uploadimg);
router.post('/update-profile', authUser, userController.changeprofile);
router.post('/follow-user', authUser, userController.createfollow);
router.get('/follow-me', authUser, userController.getfollowme);
router.get('/follow-by-me', authUser, userController.getfollowbyme);
router.post('/unfollow-user', authUser, userController.unfollow);
router.get('/my-music', authUser, userController.mymusic);



// router.post('/create-album', authUser, validateBody(schemas.albumSchema), userController.createAlbum);
// router.post('/add-list-track-album', authUser, userController.addListTrackAlbum);

module.exports = router;