const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth'); // Middleware pour vérifier les droits d'administration

router.post('/comments', auth, commentController.createComment);
router.get('/comments/:productId', commentController.getCommentsByProduct);
router.put('/comments/:id/approve', adminAuth, commentController.approveComment);
router.delete('/comments/:id', adminAuth, commentController.deleteComment);

module.exports = router;
