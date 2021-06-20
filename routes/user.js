//const express = require('express');
const authUser = require('../middlewares/authUser');
const userController = require('../controllers/user.controller');
const { validateAuth } = require('../helpers/validator-handler');
//const multer  = require('multer');
//const path = require('path');

const router = require("express-promise-router")();

router.get('/my-profile', validateAuth, authUser, userController.me);
router.get('/find', userController.find);
router.get('/view-orther-profile', userController.orther);
router.post('/changeavatar', validateAuth, authUser, userController.uploadimg);
router.post('/update-profile', validateAuth, authUser, userController.changeprofile);
router.put('/change-profile', validateAuth, authUser, userController.UpdateProfile);
router.put('/like-singer/:singerId', validateAuth, authUser, userController.likeSinger);
router.put('/like-track/:trackId', validateAuth, authUser, userController.likeTrack);
router.put('/like-album/:albumId', validateAuth, authUser, userController.likeAlbum);
router.put('/unlike-singer/:singerId', validateAuth, authUser, userController.unLikeSinger);
router.put('/unlike-track/:trackId', validateAuth, authUser, userController.unLikeTrack);
router.put('/unlike-album/:albumId', validateAuth, authUser, userController.unLikeAlbum);

module.exports = router;