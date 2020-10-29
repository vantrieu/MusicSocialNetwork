const express = require('express');
const authUser = require('../middlewares/authUser');
const userController = require('../controllers/user.controller');
const multer  = require('multer');
const path = require('path');

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        console.log(file);
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}
const upload = multer({ storage: storage, fileFilter: fileFilter });

router.post('/create', userController.create);
router.post('/login', userController.login);
router.get('/me', authUser, userController.me);
router.post('/me/logout', authUser, userController.logout);
router.post('/me/logoutall', authUser, userController.logoutall);
router.post('/me/changeavatar', authUser, userController.upload.single('image'), userController.uploadimg);


module.exports = router;