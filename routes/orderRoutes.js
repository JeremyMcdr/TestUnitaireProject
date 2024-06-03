const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth'); // Middleware pour vérifier les droits d'administration

router.post('/orders', auth, orderController.createOrder);
router.get('/orders', auth, orderController.getOrders);
router.get('/orders/:id', auth, orderController.getOrderById);
router.put('/orders/:id', auth, adminAuth, orderController.updateOrderStatus); // Admin seulement

module.exports = router;
