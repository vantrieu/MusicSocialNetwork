const express = require('express');
const authUser = require('../middlewares/authUser');
const userController = require('../controllers/user.controller')

const router = express.Router();


router.post('/create', userController.create);
router.post('/login', userController.login);
router.get('/me', authUser, userController.me);
router.post('/me/logout', authUser, userController.logout);
router.post('/me/logoutall', authUser, userController.logoutall);


module.exports = router;