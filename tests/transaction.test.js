const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const transactionRoutes = require('../routes/transactionRoutes');
const clientRoutes = require('../routes/clientRoutes');
const productRoutes = require('../routes/productRoutes');
const orderRoutes = require('../routes/orderRoutes');
const Client = require('../models/client');
const Product = require('../models/product');
const Order = require('../models/order');
const Transaction = require('../models/transaction');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use('/api', transactionRoutes);
app.use('/api', clientRoutes);
app.use('/api', productRoutes);
app.use('/api', orderRoutes);

let adminToken;
let clientToken;
let clientId;
let productId;
let orderId;
let transactionId;

beforeAll(async () => {
    jest.setTimeout(30000);
    const dbURI = `${process.env.MONGO_URI_TEST}?authSource=admin`;
    await mongoose.connect(dbURI);
    await Client.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Transaction.deleteMany({});

    let adminRes = await request(app)
        .post('/api/clients')
        .send({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'adminpassword',
            role: 'admin'
        });

    adminToken = adminRes.body.token;
    console.log('Admin Token:', adminToken);

    let clientRes = await request(app)
        .post('/api/clients')
        .send({
            name: 'Test User',
            email: 'client@example.com',
            password: 'clientpassword'
        });

    clientToken = clientRes.body.token;
    const decoded = jwt.verify(clientToken, process.env.JWT_SECRET);
    clientId = decoded.client.id;
    console.log('Client Token:', clientToken);
    console.log('Client ID:', clientId);

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

    productId = productRes.body._id;
    console.log('Product ID:', productId);

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

    orderId = orderRes.body._id;
    console.log('Order ID:', orderId);
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
                orderId: orderId,
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
        console.log('Retrieve all transactions response:', res.body);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
    });

    it('should retrieve all transactions (client)', async () => {
        const res = await request(app)
            .get('/api/transactions')
            .set('x-auth-token', clientToken);
        console.log('Retrieve all transactions response:', res.body);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
    });

    it('should retrieve a transaction by id', async () => {
        const res = await request(app)
            .get(`/api/transactions/${transactionId}`)
            .set('x-auth-token', clientToken);
        console.log('Retrieve transaction by ID response:', res.body);
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
