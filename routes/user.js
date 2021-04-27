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

module.exports = router;