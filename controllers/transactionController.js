const Transaction = require('../models/transaction');
const Order = require('../models/order');

// Créer une transaction (simuler un paiement)
exports.createTransaction = async (req, res) => {
    const { orderId, amount } = req.body;
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        const transaction = new Transaction({
            order: orderId,
            client: req.user.id,
            amount,
            status: 'completed'
        });

        await transaction.save();
        res.status(201).json(transaction);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Lister les transactions (admin ou propriétaire)
exports.getTransactions = async (req, res) => {
    try {
        const query = req.user.role === 'admin' ? {} : { client: req.user.id };
        const transactions = await Transaction.find(query).populate('order');
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Récupérer une transaction par ID (admin ou propriétaire)
exports.getTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id).populate('order');
        if (!transaction) {
            return res.status(404).json({ msg: 'Transaction not found' });
        }
        if (transaction.client.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Authorization denied' });
        }
        res.json(transaction);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Rembourser une transaction (admin seulement)
exports.refundTransaction = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Authorization denied' });
        }

        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({ msg: 'Transaction not found' });
        }

        if (transaction.status !== 'completed') {
            return res.status(400).json({ msg: 'Cannot refund a transaction that is not completed' });
        }

        transaction.status = 'refunded';
        await transaction.save();
        res.json(transaction);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
