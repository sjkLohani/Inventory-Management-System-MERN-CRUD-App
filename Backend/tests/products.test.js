const request = require('supertest');
const express = require('express');
const router = require('../Routes/router');

// Mock mongoose model so no real DB needed in CI
jest.mock('../Models/Products', () => ({
  find: jest.fn().mockResolvedValue([
    {
      _id: '6475a1b2c3d4e5f6a7b8c9d0',
      ProductName: 'Test Product',
      ProductPrice: '1000',
      ProductBarcode: '123456789012'
    }
  ]),
  findOne: jest.fn().mockResolvedValue(null),
  findById: jest.fn().mockResolvedValue(null),
  findByIdAndUpdate: jest.fn().mockResolvedValue(null),
  findByIdAndDelete: jest.fn().mockResolvedValue(null)
}));

// Build a minimal express app — no DB connection needed
const app = express();
app.use(express.json());
app.use(router);

describe('Products API', () => {
  test('GET /products — should return 201 and an array', async () => {
    const res = await request(app).get('/products');
    expect(res.statusCode).toBe(201);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /products — response should contain ProductName field', async () => {
    const res = await request(app).get('/products');
    expect(res.body[0]).toHaveProperty('ProductName');
  });
});
