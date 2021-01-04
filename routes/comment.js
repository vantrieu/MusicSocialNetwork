const authUser = require('../middlewares/authUser');
const router = require("express-promise-router")();
const CommentController = require('../controllers/comment.controller');
const { validateAuth } = require('../helpers/validator-handler');

router.post('/create-comment', validateAuth, authUser, CommentController.createComment);
router.post('/reply/:commentID', validateAuth, authUser, CommentController.replyComment);
router.post('/delete-comment/:commentID', validateAuth, authUser, CommentController.deleteComment);
router.post('/delete-reply/:replyID', validateAuth, authUser, CommentController.deleteReply);
router.post('/edit-comment/:commentID', validateAuth, authUser, CommentController.editComment);
router.post('/edit-reply/:replyID', validateAuth, authUser, CommentController.editReply);
router.get('/list-comment/:trackID', validateAuth, authUser, CommentController.getListComment);

module.exports = router;