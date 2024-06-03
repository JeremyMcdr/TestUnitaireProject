const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth'); // Middleware pour vérifier les droits d'administration

router.post('/transactions', auth, transactionController.createTransaction);
router.get('/transactions', auth, transactionController.getTransactions);
router.get('/transactions/:id', auth, transactionController.getTransactionById);
router.post('/transactions/:id/refund', auth, adminAuth, transactionController.refundTransaction); // Admin seulement

module.exports = router;
