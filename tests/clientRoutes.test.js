const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const clientRoutes = require('../routes/clientRoutes');
const Client = require('../models/client'); // Import the Client model
require('dotenv').config(); // Load environment variables

const app = express();
app.use(express.json());
app.use('/api', clientRoutes);

let adminToken; // To store the admin token for authenticated requests
let clientToken; // To store the client token for authenticated requests
let clientId; // To store the client ID for retrieval and update tests

beforeAll(async () => {
    jest.setTimeout(30000); // Set timeout to 30 seconds
    const dbURI = `${process.env.MONGO_URI_TEST}?authSource=admin`; // Specify authSource if needed
    await mongoose.connect(dbURI);

    // Clear the database
    await Client.deleteMany({});

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
                password: 'newuserpassword',
                shippingAddress: {
                    street: '789 New User St',
                    city: 'New User City',
                    state: 'New User State',
                    postalCode: '11223',
                    country: 'New User Country'
                },
                billingAddress: {
                    street: '789 New User St',
                    city: 'New User City',
                    state: 'New User State',
                    postalCode: '11223',
                    country: 'New User Country'
                }
            });
        expect(res.statusCode).toEqual(200);
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
            .set('x-auth-token', adminToken); // Use x-auth-token header
        console.log('Retrieve all clients response:', res.body); // Debugging line
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
    });

    it('should retrieve a client by id', async () => {
        const res = await request(app)
            .get(`/api/clients/${clientId}`)
            .set('x-auth-token', clientToken); // Use x-auth-token header
        console.log('Retrieve client by ID response:', res.body); // Debugging line
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('_id', clientId);
    });

    it('should update a client', async () => {
        const res = await request(app)
            .put(`/api/clients/${clientId}`)
            .set('x-auth-token', clientToken) // Use x-auth-token header
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
        console.log('Update client response:', res.body); // Debugging line
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('name', 'Updated Client');
        expect(res.body.shippingAddress).toHaveProperty('street', '123 Updated St');
    });

    it('should delete a client (admin only)', async () => {
        const res = await request(app)
            .delete(`/api/clients/${clientId}`)
            .set('x-auth-token', adminToken); // Use x-auth-token header
        console.log('Delete client response:', res.body); // Debugging line
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('msg', 'Client removed');
    });
});
