const authUser = require('../middlewares/authUser');
const router = require("express-promise-router")();
const CommentController = require('../controllers/comment.controller');

router.post('/create-comment', authUser, CommentController.createComment);
router.post('/reply/:commentID', authUser, CommentController.replyComment);
router.post('/delete-comment/:commentID', authUser, CommentController.deleteComment);
router.post('/delete-reply/:replyID', authUser, CommentController.deleteReply);
router.post('/edit-comment/:commentID', authUser, CommentController.editComment);
router.post('/edit-reply/:replyID', authUser, CommentController.editReply);
router.get('/list-comment/:trackID', authUser, CommentController.getListComment);

module.exports = router;