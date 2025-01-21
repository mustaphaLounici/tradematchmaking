const Redis = require('ioredis');
const redis = new Redis();

class OrderService {
    async createOrder({ type, itemId, price, quantity, userId }) {
        const orderId = `order:${Date.now()}:${Math.random().toString(36).substring(7)}`;
        
        // Start Redis transaction
        const multi = redis.multi();

        // Store order details
        multi.hmset(orderId, {
            orderId,
            type,
            itemId,
            price,
            quantity,
            userId,
            status: 'active',
            timestamp: Date.now()
        });

        // Add to appropriate sorted set
        const key = `${type}s:${itemId}`;
        multi.zadd(key, price, orderId);

        // Execute transaction
        await multi.exec();

        return orderId;
    }

    async getOrderBook(itemId) {
        const [bids, asks] = await Promise.all([
            redis.zrevrange(`bids:${itemId}`, 0, -1, 'WITHSCORES'),
            redis.zrange(`asks:${itemId}`, 0, -1, 'WITHSCORES')
        ]);

        return { bids, asks };
    }

    async clearOrderBook(itemId) {
        const multi = redis.multi();
        
        // Clear bids and asks
        multi.del(`bids:${itemId}`);
        multi.del(`asks:${itemId}`);
        multi.del(`trades:${itemId}`);
        multi.srem('modified_items', itemId);

        await multi.exec();
    }

    async getRecentTrades(itemId, limit = 10) {
        // Get recent trades using ZREVRANGE to get newest first
        const tradeIds = await redis.zrevrange(`trades:${itemId}`, 0, limit - 1);
        
        // Get trade details for each trade ID
        const trades = await Promise.all(
            tradeIds.map(tradeId => redis.hgetall(tradeId))
        );

        return trades.map(trade => ({
            type: parseFloat(trade.price) >= parseFloat(trade.bidPrice) ? 'ask' : 'bid',
            price: parseFloat(trade.price),
            quantity: parseInt(trade.quantity),
            timestamp: new Date(parseInt(trade.timestamp)).toLocaleTimeString()
        }));
    }
}

const orderService = new OrderService();

module.exports = {
    orderService
}; 