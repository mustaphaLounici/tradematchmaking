# Order Matching Engine Backend

The backend service for the order matching engine, built with Node.js, Express, and Redis. This service handles order processing, matching logic, and real-time updates.

## 🛠️ Architecture

- **Express Server**: REST API endpoints for order management
- **Redis Engine**: High-performance order matching and storage
- **WebSocket Server**: Real-time updates for order book and trades
- **AOF Persistence**: Reliable data storage and recovery

## 📦 Dependencies

- Node.js v16+
- Redis v6+
- Express.js
- Socket.io
- ioredis

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Redis**
   - Review `redis.conf` for custom configurations
   - Default port: 6379
   - AOF enabled for persistence

3. **Start Redis Server**
   ```bash
   npm run start:redis
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Start Production Server**
   ```bash
   npm run start
   ```

## 📡 API Endpoints

### Orders
- `POST /api/orders` - Place new order
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get specific order
- `DELETE /api/orders/:id` - Cancel order

### Order Book
- `GET /api/orderbook` - Get current order book
- `GET /api/orderbook/depth` - Get market depth

### Trades
- `GET /api/trades` - Get trade history
- `GET /api/trades/latest` - Get latest trades

## 🔄 WebSocket Events

- `orderbook`: Real-time order book updates
- `trade`: New trade notifications
- `order_status`: Order status changes

## 📊 Data Models

### Order
```typescript
{
  id: string;
  type: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  timestamp: number;
  status: 'OPEN' | 'FILLED' | 'PARTIAL' | 'CANCELLED';
}
```

### Trade
```typescript
{
  id: string;
  buyOrderId: string;
  sellOrderId: string;
  price: number;
  quantity: number;
  timestamp: number;
}
```

## ⚙️ Configuration

Environment variables:
- `PORT`: Server port (default: 3000)
- `REDIS_URL`: Redis connection URL
- `NODE_ENV`: Environment (development/production)

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run load tests
npm run test:load
```

## 📝 Logging

- Uses Winston for structured logging
- Log levels: error, warn, info, debug
- Logs stored in `logs/` directory 