const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

function calculatePoints(receipt) {
    if (!receipt.items || receipt.items.length === 0) {
        throw new Error("No items in receipt");
    }

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
        }
    });

    points += itemPoints;

    const date = dayjs.utc(receipt.purchaseDate);
    const day = date.date();
    if (day % 2 !== 0) points += 6;

    const time = dayjs.utc(`${receipt.purchaseDate} ${receipt.purchaseTime}`, "YYYY-MM-DD HH:mm");
    const twoPM = dayjs.utc(`${receipt.purchaseDate} 14:00`, "YYYY-MM-DD HH:mm");
    const fourPM = dayjs.utc(`${receipt.purchaseDate} 16:00`, "YYYY-MM-DD HH:mm");

    if (time.isAfter(twoPM) && time.isBefore(fourPM)) {
        points += 10;
    }

    return points;
}

module.exports = calculatePoints;
