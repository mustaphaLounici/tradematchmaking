const express = require('express');
const cors = require('cors');
const Redis = require('ioredis');
const { processModifiedItems } = require('./exchange');
const { orderService } = require('./services/orderService');
const logger = require('./utils/logger');

const app = express();
const redis = new Redis();

app.use(cors());
app.use(express.json());

// Track modified items that need processing
const MODIFIED_ITEMS_SET = 'modified_items';
const PROCESSING_BATCH_SIZE = 5; // Process 5 items concurrently

// Create new order
app.post('/api/orders', async (req, res) => {
    const { type, itemId, price, quantity, userId } = req.body;
    
    try {
        const orderId = await orderService.createOrder({
            type,
            itemId,
            price,
            quantity,
            userId
        });

        // Add item to modified set for processing
        await redis.sadd(MODIFIED_ITEMS_SET, itemId);
        
        res.json({ orderId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get order book for an item
app.get('/api/orderbook/:itemId', async (req, res) => {
    const { itemId } = req.params;
    
    try {
        const orderBook = await orderService.getOrderBook(itemId);
        res.json(orderBook);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Clear order book
app.post('/api/orders/clear', async (req, res) => {
    try {
        await orderService.clearOrderBook('1');
        res.json({ message: 'Order book cleared successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add this new endpoint
app.get('/api/trades/:itemId', async (req, res) => {
    const { itemId } = req.params;
    
    try {
        const trades = await orderService.getRecentTrades(itemId);
        res.json(trades);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    
    // Start the exchange processor
    startExchangeProcessor();
});

// Non-blocking exchange processor
async function startExchangeProcessor() {
    logger.log('INFO', 'Exchange processor started', {
        timestamp: new Date().toISOString()
    });

    while (true) {
        try {
            const modifiedItems = await redis.smembers(MODIFIED_ITEMS_SET);
            
            if (modifiedItems.length > 0) {
                logger.log('INFO', 'Processing modified items', {
                    itemCount: modifiedItems.length,
                    items: modifiedItems,
                    timestamp: new Date().toISOString()
                });

                // Process items in batches
                for (let i = 0; i < modifiedItems.length; i += PROCESSING_BATCH_SIZE) {
                    const batch = modifiedItems.slice(i, i + PROCESSING_BATCH_SIZE);
                    await Promise.all(batch.map(processModifiedItems));
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
            logger.log('ERROR', 'Error in exchange processor', {
                error: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
} 