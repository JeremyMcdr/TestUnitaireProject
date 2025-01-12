const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const transactionRoutes = require('../routes/transactionRoutes');
const clientRoutes = require('../routes/clientRoutes');
const productRoutes = require('../routes/productRoutes');
const orderRoutes = require('../routes/orderRoutes');
const Client = require('../models/client'); // Import the Client model
const Product = require('../models/product'); // Import the Product model
const Order = require('../models/order'); // Import the Order model
const Transaction = require('../models/transaction'); // Import the Transaction model
require('dotenv').config(); // Load environment variables

const app = express();
app.use(express.json());
app.use('/api', transactionRoutes);
app.use('/api', clientRoutes);
app.use('/api', productRoutes);
app.use('/api', orderRoutes);

let adminToken; // To store the admin token for authenticated requests
let clientToken; // To store the client token for authenticated requests
let clientId; // To store the client ID for retrieval and update tests
let productId; // To store the product ID for the order tests
let orderId; // To store the order ID for the transaction tests
let transactionId; // To store the transaction ID for retrieval and update tests

beforeAll(async () => {
    jest.setTimeout(30000); // Set timeout to 30 seconds
    const dbURI = `${process.env.MONGO_URI_TEST}?authSource=admin`; // Specify authSource if needed
    await mongoose.connect(dbURI);

    // Clear the database
    await Client.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Transaction.deleteMany({});

    // Create an admin client
    let adminRes = await request(app)
        .post('/api/clients')
        .send({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'adminpassword',
            shippingAddress: {
                street: '123 Admin St',
                city: 'Admin City',
                state: 'Admin State',
                postalCode: '12345',
                country: 'Admin Country'
            },
            billingAddress: {
                street: '123 Admin St',
                city: 'Admin City',
                state: 'Admin State',
                postalCode: '12345',
                country: 'Admin Country'
            },
            role: 'admin'
        });

    if (adminRes.body.token) {
        adminToken = adminRes.body.token; // Store the admin token for use in tests
    } else {
        // Login the admin client if it already exists
        adminRes = await request(app)
            .post('/api/clients/login')
            .send({
                email: 'admin@example.com',
                password: 'adminpassword'
            });
        adminToken = adminRes.body.token;
    }

    console.log('Admin Token:', adminToken); // Debugging line

    // Create a regular client
    let clientRes = await request(app)
        .post('/api/clients')
        .send({
            name: 'Test User',
            email: 'client@example.com',
            password: 'clientpassword',
            shippingAddress: {
                street: '456 Client St',
                city: 'Client City',
                state: 'Client State',
                postalCode: '67890',
                country: 'Client Country'
            },
            billingAddress: {
                street: '456 Client St',
                city: 'Client City',
                state: 'Client State',
                postalCode: '67890',
                country: 'Client Country'
            }
        });

    if (clientRes.body.token) {
        clientToken = clientRes.body.token; // Store the client token for use in tests
    } else {
        // Login the regular client if it already exists
        clientRes = await request(app)
            .post('/api/clients/login')
            .send({
                email: 'client@example.com',
                password: 'clientpassword'
            });
        clientToken = clientRes.body.token;
    }

    console.log('Client Response:', clientRes.body); // Log the entire client response

    console.log('Client Token:', clientToken); // Debugging line

    // Decode the token to get the client ID
    const decoded = jwt.verify(clientToken, process.env.JWT_SECRET);
    clientId = decoded.client.id; // Store the client ID for use in tests

    console.log('Client ID:', clientId); // Debugging line

    // Create a product
    let productRes = await request(app)
        .post('/api/products')
        .set('x-auth-token', adminToken)
        .send({
            name: 'Test Product',
            category: 'Test Category',
            price: 100,
            stock: 50,
            description: 'Test Description'
        });

    productId = productRes.body._id; // Store the product ID for use in tests
    console.log('Product ID:', productId); // Debugging line

    // Create an order
    let orderRes = await request(app)
        .post('/api/orders')
        .set('x-auth-token', clientToken)
        .send({
            products: [
                {
                    product: productId,
                    quantity: 2
                }
            ]
        });

    orderId = orderRes.body._id; // Store the order ID for use in tests
    console.log('Order ID:', orderId); // Debugging line
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Transaction API', () => {
    it('should create a new transaction', async () => {
        const res = await request(app)
            .post('/api/transactions')
            .set('x-auth-token', clientToken)
            .send({
                orderId,
                amount: 200
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
        transactionId = res.body._id;
    });

    it('should retrieve all transactions (admin)', async () => {
        const res = await request(app)
            .get('/api/transactions')
            .set('x-auth-token', adminToken);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
    });

    it('should retrieve all transactions (client)', async () => {
        const res = await request(app)
            .get('/api/transactions')
            .set('x-auth-token', clientToken);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
    });

    it('should retrieve a transaction by id', async () => {
        const res = await request(app)
            .get(`/api/transactions/${transactionId}`)
            .set('x-auth-token', clientToken);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('_id', transactionId);
    });

    it('should refund a transaction (admin only)', async () => {
        const res = await request(app)
            .post(`/api/transactions/${transactionId}/refund`)
            .set('x-auth-token', adminToken);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'refunded');
    });
});
