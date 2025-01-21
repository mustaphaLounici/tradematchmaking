import { Database, Wallet, Briefcase, TrendingUp, BarChart3 } from 'lucide-react'

const SEED_DATASETS = [
  {
    id: 'crypto',
    name: 'Crypto Market',
    icon: <Wallet className="w-5 h-5" />,
    description: 'BTC/USD trading scenario with high volatility',
    data: {
      bids: [
        { price: 39800, quantity: 2.5 },
        { price: 39750, quantity: 1.8 },
        { price: 39700, quantity: 3.2 },
        { price: 39650, quantity: 1.5 },
      ],
      asks: [
        { price: 39900, quantity: 1.2 },
        { price: 39950, quantity: 2.1 },
        { price: 40000, quantity: 1.7 },
        { price: 40050, quantity: 2.8 },
      ]
    }
  },
  {
    id: 'stock',
    name: 'Stock Market',
    icon: <TrendingUp className="w-5 h-5" />,
    description: 'AAPL stock with tight spread',
    data: {
      bids: [
        { price: 175.90, quantity: 100 },
        { price: 175.85, quantity: 150 },
        { price: 175.80, quantity: 200 },
        { price: 175.75, quantity: 120 },
      ],
      asks: [
        { price: 176.00, quantity: 80 },
        { price: 176.05, quantity: 150 },
        { price: 176.10, quantity: 100 },
        { price: 176.15, quantity: 180 },
      ]
    }
  },
  {
    id: 'commodity',
    name: 'Gold Market',
    icon: <Briefcase className="w-5 h-5" />,
    description: 'Gold futures with large orders',
    data: {
      bids: [
        { price: 2015.50, quantity: 50 },
        { price: 2015.00, quantity: 100 },
        { price: 2014.50, quantity: 75 },
        { price: 2014.00, quantity: 120 },
      ],
      asks: [
        { price: 2016.00, quantity: 80 },
        { price: 2016.50, quantity: 60 },
        { price: 2017.00, quantity: 90 },
        { price: 2017.50, quantity: 70 },
      ]
    }
  },
  {
    id: 'crossing',
    name: 'Crossing Orders',
    icon: <BarChart3 className="w-5 h-5" />,
    description: 'Orders that will immediately match',
    data: {
      bids: [
        { price: 100.50, quantity: 30 },
        { price: 100.00, quantity: 50 },
        { price: 99.50, quantity: 40 },
      ],
      asks: [
        { price: 99.75, quantity: 25 },
        { price: 100.25, quantity: 35 },
        { price: 100.75, quantity: 45 },
      ]
    }
  },
  {
    id: 'clear',
    name: 'Clear Book',
    icon: <Database className="w-5 h-5" />,
    description: 'Remove all orders',
    data: {
      bids: [],
      asks: []
    }
  }
];

export function DataSeeder({ onSeedData }) {
  const handleSeedClick = async (dataset) => {
    try {
      if (dataset.id === 'clear') {
        // Clear all orders using Redis ZREMRANGEBYRANK
        await fetch('http://localhost:3001/api/orders/clear', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
      } else {
        const orders = [...dataset.data.bids, ...dataset.data.asks];
        for (const order of orders) {
          await fetch('http://localhost:3001/api/orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: order === dataset.data.bids.find(b => b === order) ? 'bid' : 'ask',
              price: order.price,
              quantity: order.quantity,
              itemId: '1',
              userId: '1'
            }),
          });
        }
      }
      onSeedData && onSeedData(dataset.id);
    } catch (error) {
      console.error('Error handling dataset:', error);
    }
  };

  return (
    <div className="bg-dark-surface rounded-lg p-6 shadow-lg border border-dark-border mb-8">
      <h2 className="text-xl font-bold mb-4">Test Data Sets</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {SEED_DATASETS.map((dataset) => (
          <button
            key={dataset.id}
            onClick={() => handleSeedClick(dataset)}
            className="flex flex-col items-center p-4 bg-dark-bg rounded-lg border border-dark-border
                     hover:border-blue-500 transition-colors duration-200"
          >
            <div className="mb-2">
              {dataset.icon}
            </div>
            <h3 className="font-medium text-sm mb-1">{dataset.name}</h3>
            <p className="text-xs text-gray-400 text-center">{dataset.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
} 