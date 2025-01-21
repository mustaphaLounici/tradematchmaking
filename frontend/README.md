# Order Matching Engine Frontend

A modern React application built with Vite that provides a real-time interface for the order matching engine. Features interactive order management, live order book visualization, and trade history.

## 🎨 Features

- **Order Management**
  - Intuitive order placement interface
  - Real-time order status updates
  - Order cancellation
  - Order history view

- **Market Data Visualization**
  - Live order book display
  - Price chart with technical indicators
  - Market depth visualization
  - Trade history feed

- **User Interface**
  - Responsive design for all devices
  - Dark/Light theme support
  - Customizable layouts
  - Real-time notifications

## 🛠️ Tech Stack

- React 18
- Vite
- Tailwind CSS
- Socket.io-client
- Chart.js for visualizations
- React Query for data fetching

## 📦 Prerequisites

- Node.js v16+
- npm or yarn
- Backend service running

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   Access the application at `http://localhost:5173`

3. **Build for Production**
   ```bash
   npm run build
   npm run preview
   ```

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
├── pages/               # Page components
├── hooks/               # Custom React hooks
├── services/            # API and WebSocket services
├── store/               # State management
├── utils/               # Helper functions
└── styles/              # Global styles and Tailwind config
```

## 🔌 API Integration

### REST Endpoints
- Configuration in `src/services/api.js`
- Handles all HTTP requests to backend
- Includes error handling and retries

### WebSocket Events
- Real-time order book updates
- Trade notifications
- Order status changes
- Market data streams

## 🎨 UI Components

### OrderBook
- Displays bid/ask orders
- Price aggregation
- Depth visualization
- Real-time updates

### TradeHistory
- Recent trades list
- Price/volume information
- Time and date display
- Filterable view

### OrderForm
- Market/limit order support
- Price and quantity inputs
- Order validation
- Quick order placement

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run component tests
npm run test:components

# Run E2E tests
npm run test:e2e
```

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px

## 🔧 Configuration

Environment variables:
- `VITE_API_URL`: Backend API URL
- `VITE_WS_URL`: WebSocket server URL
- `VITE_ENV`: Environment name

## 📈 Performance

- Code splitting
- Lazy loading
- Memoization
- Asset optimization
- Lighthouse score > 90
