const request = require('supertest');
const app = require('../src/index');

describe('Receipt Processor API', () => {
    it('should process a receipt and return an ID', async () => {
        const response = await request(app)
            .post('/receipts/process')
            .send({
                retailer: "Target",
                purchaseDate: "2022-01-01",
                purchaseTime: "13:01",
                items: [{ shortDescription: "Item", price: "1.00" }],
                total: "1.00"
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('id');
    });

    it('should return points for a valid receipt ID', async () => {
        const processResponse = await request(app)
            .post('/receipts/process')
            .send({
                retailer: "Target",
                purchaseDate: "2022-01-01",
                purchaseTime: "13:01",
                items: [{ shortDescription: "Item", price: "1.00" }],
                total: "1.00"
            });

        const id = processResponse.body.id;

        const pointsResponse = await request(app).get(`/receipts/${id}/points`);
        expect(pointsResponse.statusCode).toBe(200);
        expect(pointsResponse.body).toHaveProperty('points');
    });
});
