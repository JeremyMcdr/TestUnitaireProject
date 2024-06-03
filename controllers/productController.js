const Product = require('../models/product');

// Ajouter un produit (admin seulement)
exports.createProduct = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Authorization denied' });
        }

        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Modifier un produit (admin seulement)
exports.updateProduct = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Authorization denied' });
        }

        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Supprimer un produit (admin seulement)
exports.deleteProduct = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Authorization denied' });
        }

        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Lister les produits
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Récupérer un produit par ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Rechercher des produits par nom, catégorie ou prix
exports.searchProducts = async (req, res) => {
    try {
        const { name, category, minPrice, maxPrice } = req.query;
        let searchQuery = {};

        if (name) {
            searchQuery.name = { $regex: name, $options: 'i' }; // Recherche insensible à la casse par nom
        }
        if (category) {
            searchQuery.category = { $regex: category, $options: 'i' }; // Recherche insensible à la casse par catégorie
        }
        if (minPrice || maxPrice) {
            searchQuery.price = {};
            if (minPrice) {
                searchQuery.price.$gte = Number(minPrice); // Prix supérieur ou égal à minPrice
            }
            if (maxPrice) {
                searchQuery.price.$lte = Number(maxPrice); // Prix inférieur ou égal à maxPrice
            }
        }

        const products = await Product.find(searchQuery);
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
