const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

router.post('/products', auth, adminAuth, productController.createProduct); // Admin seulement
router.put('/products/:id', auth, adminAuth, productController.updateProduct); // Admin seulement
router.delete('/products/:id', auth, adminAuth, productController.deleteProduct); // Admin seulement
router.get('/products/search', productController.searchProducts);
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductById);

module.exports = router;
