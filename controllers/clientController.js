const Client = require('../models/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Créer un client
exports.createClient = async (req, res) => {
    const { name, email, password, shippingAddress, billingAddress, role } = req.body;

    try {
        let client = await Client.findOne({ email });
        if (client) {
            return res.status(400).json({ msg: 'Client already exists' });
        }

        client = new Client({
            name,
            email,
            password,
            shippingAddress,
            billingAddress,
            role: role || 'user',  // Défaut à 'user' si le rôle n'est pas spécifié
        });

        const salt = await bcrypt.genSalt(10);
        client.password = await bcrypt.hash(password, salt);

        await client.save();

        const payload = {
            client: {
                id: client.id,
                role: client.role,  // Inclure le rôle dans le token
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        res.status(500).send('Server error');
    }
};

// Client login
exports.loginClient = async (req, res) => {
    const { email, password } = req.body;

    try {
        let client = await Client.findOne({ email });
        if (!client) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, client.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = {
            client: {
                id: client.id,
                role: client.role,  // Inclure le rôle dans le token
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        res.status(500).send('Server error');
    }
};

// Lister les clients (admin seulement)
exports.getClients = async (req, res) => {
    try {
        const clients = await Client.find();
        res.json(clients);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

// Récupérer un client par ID
exports.getClientById = async (req, res) => {
    try {
        if (req.user.id !== req.params.id && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Authorization denied' });
        }

        const client = await Client.findById(req.params.id);
        if (!client) {
            return res.status(404).json({ msg: 'Client not found' });
        }
        res.json(client);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

// Modifier un client
exports.updateClient = async (req, res) => {
    const { name, email, shippingAddress, billingAddress } = req.body;

    try {
        if (req.user.id !== req.params.id && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Authorization denied' });
        }

        let client = await Client.findById(req.params.id);
        if (!client) {
            return res.status(404).json({ msg: 'Client not found' });
        }

        client.name = name || client.name;
        client.email = email || client.email;
        client.shippingAddress = shippingAddress || client.shippingAddress;
        client.billingAddress = billingAddress || client.billingAddress;

        await client.save();
        res.json(client);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

// Supprimer un client (admin seulement)
exports.deleteClient = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Authorization denied' });
        }

        console.log('Delete request received for client ID:', req.params.id); // Add this line

        let client = await Client.findById(req.params.id);
        if (!client) {
            console.log('Client not found'); // Add this line
            return res.status(404).json({ msg: 'Client not found' });
        }

        await client.deleteOne(); // Use deleteOne instead of remove
        res.json({ msg: 'Client removed' });
    } catch (err) {
        console.error('Error while deleting client:', err); // Add this line
        res.status(500).send('Server error');
    }
};
