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
        }
    });
    points += itemPoints;

    const day = parseInt(receipt.purchaseDate.split('-')[2], 10);
    if (day % 2 !== 0) points += 6;

    const [hour, minute] = receipt.purchaseTime.split(':').map(Number);
    const timeInMinutes = hour * 60 + minute;
    const twoPMInMinutes = 14 * 60;
    const fourPMInMinutes = 16 * 60; 

    if (timeInMinutes > twoPMInMinutes && timeInMinutes < fourPMInMinutes) {
        points += 10;
    }
    return points;
}

module.exports = calculatePoints;
