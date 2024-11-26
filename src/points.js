const dayjs = require('dayjs');

function calculatePoints(receipt) {
    let points = 0;

    const retailerPoints = receipt.retailer.replace(/[^a-zA-Z0-9]/g, '').length;
    points += retailerPoints;

    const total = parseFloat(receipt.total);
    if (total % 1 === 0) points += 50;

    if (total % 0.25 === 0) points += 25;

    const pairPoints = Math.floor(receipt.items.length / 2) * 5;
    points += pairPoints;

    let itemPoints = 0;
    receipt.items.forEach(item => {
        const descriptionLength = item.shortDescription.trim().length;
        if (descriptionLength % 3 === 0) {
            itemPoints += Math.ceil(parseFloat(item.price) * 0.2);
        };
    });
    
    points += itemPoints;

    const date = dayjs(receipt.purchaseDate);
    const day = date.date();
    if (day % 2 !== 0) points += 6;

    const time = dayjs(`${receipt.purchaseDate} ${receipt.purchaseTime}`);
    const twoPM = dayjs(`${receipt.purchaseDate} 14:00`);
    const fourPM = dayjs(`${receipt.purchaseDate} 16:00`);

    if (time.isAfter(twoPM) && time.isBefore(fourPM)) {
        points += 10;
    };

    return points;
};

module.exports = calculatePoints;
