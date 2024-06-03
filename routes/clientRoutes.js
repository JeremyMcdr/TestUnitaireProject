const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth'); // Middleware pour vérifier les droits d'administration

router.post('/clients', clientController.createClient);
router.post('/clients/login', clientController.loginClient);
router.get('/clients', auth, adminAuth, clientController.getClients); // Admin seulement
router.get('/clients/:id', auth, clientController.getClientById);
router.put('/clients/:id', auth, clientController.updateClient);
router.delete('/clients/:id', auth, adminAuth, clientController.deleteClient); // Admin seulement

module.exports = router;
