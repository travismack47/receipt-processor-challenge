const receipts = new Map();

function saveReceipt(id, points) {
    receipts.set(id, points);
}

function getReceiptPoints(id) {
    return receipts.get(id) || null;
}

module.exports = {saveReceipt, getReceiptPoints};
