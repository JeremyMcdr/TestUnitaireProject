const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        required: true,
    },
    approved: {
        type: Boolean,
        default: false,
    },
    commentDate: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Comment', CommentSchema);
