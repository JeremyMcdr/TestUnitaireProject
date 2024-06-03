const Order = require('../models/order');
const Product = require('../models/product');

// Créer une commande
exports.createOrder = async (req, res) => {
    const { products } = req.body;
    try {
        let totalAmount = 0;
        let updatedProducts = [];

        // Vérifier le stock et calculer le montant total
        for (let item of products) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ msg: `Product with id ${item.product} not found` });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({ msg: `Insufficient stock for product ${product.name}` });
            }

            totalAmount += product.price * item.quantity;
            updatedProducts.push({
                product: item.product,
                quantity: item.quantity,
                price: product.price,
                name: product.name
            });

            // Réduire le stock
            product.stock -= item.quantity;
            await product.save();
        }

        const order = new Order({
            client: req.user.id,
            products: updatedProducts,
            totalAmount
        });

        await order.save();
        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Lister les commandes (admin ou propriétaire)
exports.getOrders = async (req, res) => {
    try {
        const query = req.user.role === 'admin' ? {} : { client: req.user.id };
        const orders = await Order.find(query).populate('products.product');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Récupérer une commande par ID (admin ou propriétaire)
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('products.product');
        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }
        if (order.client.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Authorization denied' });
        }
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Mettre à jour le statut d'une commande (admin seulement)
exports.updateOrderStatus = async (req, res) => {
    const { status } = req.body;

    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Authorization denied' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        order.status = status;
        await order.save();
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
