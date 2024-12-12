const calculatePoints = require("../src/points.js");

describe("calculatePoints", () => {
  it("should calculate points correctly for a given receipt (mixed conditions)", () => {
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

    const points = calculatePoints(receipt);
    expect(points).toBe(28);
  });

  it("should handle receipts with a round dollar total", () => {
    const receipt = {
      retailer: "Walmart",
      purchaseDate: "2022-03-15",
      purchaseTime: "15:30",
      items: [
        { shortDescription: "Large Bath Towels", price: "100.00" }
      ],
      total: "100.00",
    };

    const points = calculatePoints(receipt);
    expect(points).toBe(98);
  });

  it("should calculate points for item descriptions with a length multiple of 3", () => {
    const receipt = {
      retailer: "Store123",
      purchaseDate: "2022-06-10",
      purchaseTime: "10:45",
      items: [
        { shortDescription: "Triple Milk", price: "3.00" },
        { shortDescription: "Egg", price: "2.00" },
      ],
      total: "5.00",
    };

    const points = calculatePoints(receipt);
    expect(points).toBe(89);
  });

  it("should throw an error if no items are provided", () => {
    const receipt = {
      retailer: "EmptyStore",
      purchaseDate: "2022-02-02",
      purchaseTime: "08:00",
      items: [],
      total: "0.00",
    };

    expect(() => calculatePoints(receipt)).toThrow();
  });

  it("should calculate points for purchases made between 2:00pm and 4:00pm", () => {
    const receipt = {
      retailer: "Afternoon Mart",
      purchaseDate: "2022-04-01",
      purchaseTime: "14:15",
      items: [
        { shortDescription: "Afternoon Cookies", price: "25.00" }
      ],
      total: "25.00",
    };

    const points = calculatePoints(receipt);
    expect(points).toBe(104);
  });

  it("should calculate points for purchases made on an odd day", () => {
    const receipt = {
      retailer: "Odd Day Mart",
      purchaseDate: "2023-06-03",
      purchaseTime: "13:25",
      items: [{ shortDescription: "Bubble Gum", price: "2.50" }],
      total: "2.50",
    };

    const points = calculatePoints(receipt);
    expect(points).toBe(41);
  });

  it("should add 25 points for totals divisible by 0.25 but not whole number, and not 50 points", () => {
     const receipt = {
      retailer: "QuarterMart",
      purchaseDate: "2022-05-10",
      purchaseTime: "09:00",
      items: [
        { shortDescription: "Egg", price: "0.75" }
      ],
      total: "0.75",
    };

    const points = calculatePoints(receipt);
    expect(points).toBe(37);
  });

  it("should award pair points correctly for multiple items", () => {
    const receipt = {
      retailer: "PairStore",
      purchaseDate: "2022-08-20",
      purchaseTime: "11:00",
      items: [
        { shortDescription: "Granola Bar", price: "1.00" },
        { shortDescription: "Fruit Salad", price: "2.00" },
        { shortDescription: "Apple Juice", price: "3.00" },
        { shortDescription: "Chocolate Cake", price: "4.00" },
      ],
      total: "10.00",
    };

    const points = calculatePoints(receipt);
    expect(points).toBe(94);
  });

  it("should only award retailer name points if no other conditions are met", () => {
    const receipt = {
      retailer: "JustAStore123",
      purchaseDate: "2022-08-02",
      purchaseTime: "00:01",
      items: [{ shortDescription: "TestItem", price: "1.10" }],
      total: "1.10",
    };

    const points = calculatePoints(receipt);
    expect(points).toBe(13);
  });
});
