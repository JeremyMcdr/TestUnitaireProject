const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const productRoutes = require('../routes/productRoutes');
const clientRoutes = require('../routes/clientRoutes');
require('dotenv').config(); // Load environment variables

const app = express();
app.use(express.json());
app.use('/api', productRoutes);
app.use('/api', clientRoutes);

let token; // To store the token for authenticated requests

// Mocking the auth middleware
jest.mock('../middleware/auth', () => (req, res, next) => {
    req.user = { id: 'mockUserId', role: 'admin' }; // Mock user as admin
    next();
});
jest.mock('../middleware/adminAuth', () => (req, res, next) => {
    next();
});

beforeAll(async () => {
    jest.setTimeout(30000); // Set timeout to 30 seconds
    const dbURI = `${process.env.MONGO_URI_TEST}?authSource=admin`; // Specify authSource if needed
    console.log(dbURI);
    await mongoose.connect(dbURI);

    // Create an admin client
    const res = await request(app)
        .post('/api/clients')
        .send({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'adminpassword',
            shippingAddress: '123 Admin St',
            billingAddress: '123 Admin St',
            role: 'admin'
        });
    token = res.body.token; // Store the token for use in tests
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Product API', () => {
    let productId;

    it('should create a new product', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Test Product',
                category: 'Test Category',
                price: 100,
                stock: 10,
                description: 'Test Description'
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
        productId = res.body._id;
    });

    it('should retrieve all products', async () => {
        const res = await request(app)
            .get('/api/products')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
    });

    it('should retrieve a product by id', async () => {
        const res = await request(app)
            .get(`/api/products/${productId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('_id', productId);
    });

    it('should update a product', async () => {
        const res = await request(app)
            .put(`/api/products/${productId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Updated Product',
                category: 'Updated Category',
                price: 150,
                stock: 15
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('name', 'Updated Product');
    });

    it('should delete a product', async () => {
        const res = await request(app)
            .delete(`/api/products/${productId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Product deleted successfully');
    });
});
