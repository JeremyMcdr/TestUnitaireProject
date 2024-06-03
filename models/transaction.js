const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'refunded'],
        default: 'pending'
    },
    transactionDate: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
