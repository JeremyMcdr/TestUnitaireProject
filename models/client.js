const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
});

const ClientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    shippingAddress: AddressSchema,
    billingAddress: AddressSchema,
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
});

module.exports = mongoose.model('Client', ClientSchema);
