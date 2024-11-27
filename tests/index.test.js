const request = require("supertest");
const app = require("../src/index");
let maxReceiptRequests = 20;

describe("Receipt Processor API", () => {
  it("should process a receipt and return an ID", async () => {
    const response = await request(app)
      .post("/receipts/process")
      .send({
        retailer: "Target",
        purchaseDate: "2022-01-01",
        purchaseTime: "13:01",
        items: [{ shortDescription: "Item", price: "1.00" }],
        total: "1.00",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("id");
  });

  it("should return points for a valid receipt ID", async () => {
    const processResponse = await request(app)
      .post("/receipts/process")
      .send({
        retailer: "Target",
        purchaseDate: "2022-01-01",
        purchaseTime: "13:01",
        items: [{ shortDescription: "Item", price: "1.00" }],
        total: "1.00",
      });

    const id = processResponse.body.id;

    const pointsResponse = await request(app).get(`/receipts/${id}/points`);
    expect(pointsResponse.statusCode).toBe(200);
    expect(pointsResponse.body).toHaveProperty("points");
  });

  it("should return 400 Bad Request when required fields are missing", async () => {
    const response = await request(app)
      .post("/receipts/process")
      .send({
        purchaseDate: "2022-01-01",
        purchaseTime: "13:01",
        items: [{ shortDescription: "Item", price: "1.00" }],
        total: "1.00",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("should return 400 Bad Request when data types are invalid", async () => {
    const response = await request(app)
      .post("/receipts/process")
      .send({
        retailer: 12345,
        purchaseDate: "2022-01-01",
        purchaseTime: "13:01",
        items: [{ shortDescription: "Item", price: "1.00" }],
        total: "1.00",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("should return 400 Bad Request when date format is invalid", async () => {
    const response = await request(app)
      .post("/receipts/process")
      .send({
        retailer: "Target",
        purchaseDate: "01-01-2022",
        purchaseTime: "13:01",
        items: [{ shortDescription: "Item", price: "1.00" }],
        total: "1.00",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("should return 400 Bad Request when time format is invalid", async () => {
    const response = await request(app)
      .post("/receipts/process")
      .send({
        retailer: "Target",
        purchaseDate: "2022-01-01",
        purchaseTime: "25:61",
        items: [{ shortDescription: "Item", price: "1.00" }],
        total: "1.00",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("should return 400 Bad Request when items array is empty", async () => {
    const response = await request(app).post("/receipts/process").send({
      retailer: "Target",
      purchaseDate: "2022-01-01",
      purchaseTime: "13:01",
      items: [],
      total: "1.00",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("should return 404 Not Found for a non-existent receipt ID", async () => {
    const response = await request(app).get("/receipts/nonexistent-id/points");
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("error", "Receipt not found");
  });

  it("should calculate the correct points for a sample receipt", async () => {
    const receipt = {
      retailer: "Target",
      purchaseDate: "2022-01-01",
      purchaseTime: "13:01",
      items: [
        { shortDescription: "Mountain Dew 12PK", price: "6.49" },
        { shortDescription: "Emils Cheese Pizza", price: "12.25" },
        { shortDescription: "Knorr Creamy Chicken", price: "1.26" },
        { shortDescription: "Doritos Nacho Cheese", price: "3.35" },
        { shortDescription: "   Klarbrunn 12-PK 12 FL OZ  ", price: "12.00" },
      ],
      total: "35.35",
    };

    const expectedPoints = 28;

    const processResponse = await request(app)
      .post("/receipts/process")
      .send(receipt);

    const id = processResponse.body.id;

    const pointsResponse = await request(app).get(`/receipts/${id}/points`);
    expect(pointsResponse.statusCode).toBe(200);
    expect(pointsResponse.body).toHaveProperty("points", expectedPoints);
  });

  it("should sanitize input to prevent XSS attacks", async () => {
    const response = await request(app)
      .post("/receipts/process")
      .send({
        retailer: "<script>alert('XSS')</script>",
        purchaseDate: "2022-01-01",
        purchaseTime: "13:01",
        items: [
          {
            shortDescription: "<img src=x onerror=alert('XSS')>",
            price: "1.00",
          },
        ],
        total: "1.00",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  describe("Receipt Processor API Rate Limiting", () => {
    it("should enforce rate limiting and return 429 after exceeding the limit", async () => {
      const receipt = {
        retailer: "Rate Limit Test",
        purchaseDate: "2022-01-01",
        purchaseTime: "13:01",
        items: [{ shortDescription: "Item", price: "1.00" }],
        total: "1.00",
      };
  
      const promises = [];
  
      // Make 30 requests to exceed the limit of 20
      for (let i = 0; i < 30; i++) {
        promises.push(
          request(app)
            .post("/receipts/process")
            .set("X-Forwarded-For", "123.123.123.123")
            .send(receipt)
        );
      }
  
      const responses = await Promise.all(promises);
  
      const successfulRequests = responses.filter(
        (response) => response.statusCode === 200
      ).length;
      const tooManyRequestsCount = responses.filter(
        (response) => response.statusCode === 429
      ).length;
  
      expect(successfulRequests).toBe(maxReceiptRequests); // Should be 20
      expect(tooManyRequestsCount).toBe(30 - maxReceiptRequests); // Should be 10
      maxReceiptRequests = 0;
    });
  
    it("should handle multiple concurrent requests and enforce rate limits", async () => {
      const receipt = {
        retailer: "Concurrent Test",
        purchaseDate: "2022-01-01",
        purchaseTime: "13:01",
        items: [{ shortDescription: "Item", price: "1.00" }],
        total: "1.00",
      };
  
      const promises = [];
  
      for (let i = 0; i < 30; i++) {
        promises.push(
          request(app)
            .post("/receipts/process")
            .set("X-Forwarded-For", "123.123.123.123")
            .send(receipt)
        );
      }
  
      const responses = await Promise.all(promises);
  
      responses.forEach((response, index) => {
        if (index < maxReceiptRequests) {
          expect(response.statusCode).toBe(200);
          expect(response.body).toHaveProperty("id");
        } else {
          expect(response.statusCode).toBe(429);
        }
      });
      maxReceiptRequests = 0;
    });
  });
});
