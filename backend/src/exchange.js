const Redis = require('ioredis');
const logger = require('./utils/logger');
const { orderService } = require('./services/orderService');

// Configure Redis with AOF
const redis = new Redis({
    port: 6379,
    host: '127.0.0.1',
    appendOnly: true,
    appendfsync: 'everysec'
});

async function processModifiedItems(itemId) {
    const cycleStartTime = Date.now();
    let matchCount = 0;
    let totalVolume = 0;

    try {
        logger.log('INFO', `Starting matching cycle for item ${itemId}`, {
            itemId,
            timestamp: new Date().toISOString()
        });

        while (true) {
            // Get highest bid and lowest ask using ZRANGE
            const [[topBidId, topBidPrice], [topAskId, topAskPrice]] = await Promise.all([
                redis.zrevrange(`bids:${itemId}`, 0, 0, 'WITHSCORES'),
                redis.zrange(`asks:${itemId}`, 0, 0, 'WITHSCORES')
            ]);

            if (!topBidId || !topAskId || parseFloat(topBidPrice) < parseFloat(topAskPrice)) {
                break; // No more matches possible
            }

            // Get order details
            const [bid, ask] = await Promise.all([
                redis.hgetall(topBidId),
                redis.hgetall(topAskId)
            ]);

            // Execute trade atomically
            const matchResult = await executeMatch(bid, ask, itemId);
            matchCount++;
            totalVolume += matchResult.tradeQuantity * matchResult.price;

            logger.log('MATCH', `Match executed for item ${itemId}`, {
                matchId: matchResult.tradeId,
                bidOrderId: bid.orderId,
                askOrderId: ask.orderId,
                price: matchResult.price,
                quantity: matchResult.tradeQuantity,
                timestamp: new Date().toISOString()
            });
        }

        // Remove item from modified set once processing is complete
        await redis.srem('modified_items', itemId);

        const cycleEndTime = Date.now();
        logger.log('INFO', `Matching cycle completed for item ${itemId}`, {
            itemId,
            cycleTimeMs: cycleEndTime - cycleStartTime,
            matchCount,
            totalVolume,
            timestamp: new Date().toISOString()
        });

        // Get and log current order book state
        const [bidCount, askCount] = await Promise.all([
            redis.zcard(`bids:${itemId}`),
            redis.zcard(`asks:${itemId}`)
        ]);

        logger.log('INFO', `Order book state for item ${itemId}`, {
            itemId,
            remainingBids: bidCount,
            remainingAsks: askCount,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.log('ERROR', `Error processing item ${itemId}`, {
            itemId,
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
    }
}

async function executeMatch(bid, ask, itemId) {
    const tradeQuantity = Math.min(parseInt(bid.quantity), parseInt(ask.quantity));
    const price = parseFloat(ask.price);
    const tradeId = `trade:${Date.now()}:${Math.random().toString(36).substring(7)}`;

    // Start Redis transaction
    const multi = redis.multi();

    // Update order quantities
    multi.hincrby(bid.orderId, 'quantity', -tradeQuantity);
    multi.hincrby(ask.orderId, 'quantity', -tradeQuantity);

    // Remove filled orders from order book
    if (parseInt(bid.quantity) <= tradeQuantity) {
        multi.zrem(`bids:${itemId}`, bid.orderId);
    }
    if (parseInt(ask.quantity) <= tradeQuantity) {
        multi.zrem(`asks:${itemId}`, ask.orderId);
    }

    // Record the trade with more details
    multi.hmset(tradeId, {
        bidOrderId: bid.orderId,
        askOrderId: ask.orderId,
        bidPrice: bid.price,    // Add bid price for reference
        askPrice: ask.price,    // Add ask price for reference
        price,
        quantity: tradeQuantity,
        timestamp: Date.now()
    });
    multi.zadd(`trades:${itemId}`, Date.now(), tradeId);

    // Execute all commands atomically
    await multi.exec();

    return {
        tradeId,
        price,
        tradeQuantity
    };
}

module.exports = {
    processModifiedItems
}; 