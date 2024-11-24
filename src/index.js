require('dotenv').config();
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const calculatePoints = require('./points.js');
const { saveReceipt, getReceiptPoints } = require('./storage.js');

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post('/receipts/process', (req, res) => {
    const receipt = req.body;

    if (!receipt || !receipt.retailer || !receipt.purchaseDate || !receipt.purchaseTime || !receipt.items || !receipt.total) {
        res.status(400).json({error: 'Invalid receipt data'});
    };

    const id = uuidv4();
    const points = calculatePoints(receipt);

    saveReceipt(id, points);

    res.status(200).json({id});
});

app.get('/receipts/:id/points', (req, res) => {
    const id = req.params.id;
    const points = getReceiptPoints(id);

    if (points === null) {
        return res.status(404).json({error: 'Receipt not found'});
    }

    res.status(200).json({points});
});

app.listen(PORT, () => {
    console.log('Server running on PORT', PORT)
});

module.exports = app;