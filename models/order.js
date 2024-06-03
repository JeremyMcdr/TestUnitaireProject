const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        name: {
            type: String,
            required: true,
        }
    }],
    totalAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'in progress', 'shipped', 'delivered'],
        default: 'pending'
    },
    orderDate: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Order', OrderSchema);
