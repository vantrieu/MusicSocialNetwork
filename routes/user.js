//const express = require('express');
const authUser = require('../middlewares/authUser');
const userController = require('../controllers/user.controller');
const { validateAuth } = require('../helpers/validator-handler');
//const multer  = require('multer');
//const path = require('path');

const router = require("express-promise-router")();

router.get('/my-profile', validateAuth, authUser, userController.me);
router.get('/find', validateAuth, authUser, userController.find);
router.get('/view-orther-profile', validateAuth, authUser, userController.orther);
router.post('/changeavatar', validateAuth, authUser, userController.uploadimg);
router.post('/update-profile', validateAuth, authUser, userController.changeprofile);
router.post('/follow-user', validateAuth, authUser, userController.createfollow);
router.get('/follow-me', validateAuth, authUser, userController.getfollowme);
router.get('/follow-by-me', validateAuth, authUser, userController.getfollowbyme);
router.post('/unfollow-user', validateAuth, authUser, userController.unfollow);
router.get('/my-music', validateAuth, authUser, userController.mymusic);



// router.post('/create-album', authUser, validateBody(schemas.albumSchema), userController.createAlbum);
// router.post('/add-list-track-album', authUser, userController.addListTrackAlbum);

module.exports = router;