const Comment = require('../models/comment');
const Product = require('../models/product');

// Créer un commentaire
exports.createComment = async (req, res) => {
    const { product, rating, comment } = req.body;
    try {
        const productExists = await Product.findById(product);
        if (!productExists) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        const newComment = new Comment({
            product,
            client: req.user.id,
            rating,
            comment,
        });

        await newComment.save();
        res.status(201).json(newComment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Récupérer les commentaires d'un produit
exports.getCommentsByProduct = async (req, res) => {
    try {
        const comments = await Comment.find({ product: req.params.productId, approved: true }).populate('client', 'name');
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Approuver un commentaire
exports.approveComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ msg: 'Comment not found' });
        }

        comment.approved = true;
        await comment.save();
        res.json(comment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Supprimer un commentaire
exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ msg: 'Comment not found' });
        }

        await comment.remove();
        res.json({ msg: 'Comment deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
