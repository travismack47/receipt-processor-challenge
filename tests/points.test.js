const calculatePoints = require('../src/points');

describe('calculatePoints', () => {
    it('should calculate points correctly for a given receipt', () => {
        const receipt = {
            retailer: "Target",
            purchaseDate: "2022-01-01",
            purchaseTime: "13:01",
            items: [
                { shortDescription: "Mountain Dew 12PK", price: "6.49" },
                { shortDescription: "Emils Cheese Pizza", price: "12.25" },
                { shortDescription: "Knorr Creamy Chicken", price: "1.26" },
                { shortDescription: "Doritos Nacho Cheese", price: "3.35" },
                { shortDescription: "   Klarbrunn 12-PK 12 FL OZ  ", price: "12.00" }
            ],
            total: "35.35"
        };

        const points = calculatePoints(receipt);
        expect(points).toBe(28);
    });

    it('should handle receipts with a round dollar total', () => {
        const receipt = {
            retailer: "Walmart",
            purchaseDate: "2022-03-15",
            purchaseTime: "15:30",
            items: [],
            total: "100.00"
        };
    
        const points = calculatePoints(receipt);
        expect(points).toBe(98); 
    });    

    it('should calculate points for item descriptions with a length multiple of 3', () => {
        const receipt = {
            retailer: "Store123",
            purchaseDate: "2022-06-10",
            purchaseTime: "10:45",
            items: [
                { shortDescription: "Triple Milk", price: "3.00" },
                { shortDescription: "  Apple ", price: "2.00" }
            ],
            total: "5.00"
        };

        const points = calculatePoints(receipt);
        expect(points).toBe(10); 
    });

    it('should handle empty items gracefully', () => {
        const receipt = {
            retailer: "EmptyStore",
            purchaseDate: "2022-02-02",
            purchaseTime: "08:00",
            items: [],
            total: "0.00"
        };

        const points = calculatePoints(receipt);
        expect(points).toBe(10); 
    });

    it('should calculate points for purchases made between 2:00pm and 4:00pm', () => {
        const receipt = {
            retailer: "Afternoon Mart",
            purchaseDate: "2022-04-01",
            purchaseTime: "14:15",
            items: [],
            total: "25.00"
        };

        const points = calculatePoints(receipt);
        expect(points).toBe(85); 
    });
});
