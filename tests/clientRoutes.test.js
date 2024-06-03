const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const clientRoutes = require('../routes/clientRoutes');
const Client = require('../models/client');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use('/api', clientRoutes);

let adminToken;
let clientToken;
let clientId;

beforeAll(async () => {
    jest.setTimeout(30000);
    const dbURI = `${process.env.MONGO_URI_TEST}?authSource=admin`;
    await mongoose.connect(dbURI);
    await Client.deleteMany({});

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
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Client API', () => {
    it('should create a new client', async () => {
        const res = await request(app)
            .post('/api/clients')
            .send({
                name: 'New User',
                email: 'newuser@example.com',
                password: 'newpassword'
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('token');
    });

    it('should login a client', async () => {
        const res = await request(app)
            .post('/api/clients/login')
            .send({
                email: 'client@example.com',
                password: 'clientpassword'
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });

    it('should retrieve all clients (admin only)', async () => {
        const res = await request(app)
            .get('/api/clients')
            .set('x-auth-token', adminToken);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
    });

    it('should retrieve a client by id', async () => {
        const res = await request(app)
            .get(`/api/clients/${clientId}`)
            .set('x-auth-token', clientToken);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('_id', clientId);
    });

    it('should update a client', async () => {
        const res = await request(app)
            .put(`/api/clients/${clientId}`)
            .set('x-auth-token', clientToken)
            .send({
                name: 'Updated Client',
                shippingAddress: {
                    street: '123 Updated St',
                    city: 'Updated City',
                    state: 'Updated State',
                    postalCode: '99999',
                    country: 'Updated Country'
                }
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('name', 'Updated Client');
        expect(res.body.shippingAddress).toHaveProperty('street', '123 Updated St');
    });

    it('should delete a client (admin only)', async () => {
        const res = await request(app)
            .delete(`/api/clients/${clientId}`)
            .set('x-auth-token', adminToken);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('msg', 'Client removed');
    });
});
