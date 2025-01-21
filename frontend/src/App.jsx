import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, TrendingDown, CheckCircle2, AlertCircle } from 'lucide-react'
import { DataSeeder } from './components/DataSeeder'
import { SystemInfo } from './components/SystemInfo'
import './App.css'

function App() {
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [newOrder, setNewOrder] = useState({
    type: 'bid',
    itemId: '1',
    price: '',
    quantity: '',
    userId: '1'
  });
  const [trades, setTrades] = useState([]);
  const [matchAnimation, setMatchAnimation] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrderBook = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/api/orderbook/1');
      const data = await response.json();
      
      const formattedBids = [];
      const formattedAsks = [];
      
      for (let i = 0; i < data.bids.length; i += 2) {
        formattedBids.push({
          id: data.bids[i],
          price: parseFloat(data.bids[i + 1]).toFixed(2)
        });
      }
      
      for (let i = 0; i < data.asks.length; i += 2) {
        formattedAsks.push({
          id: data.asks[i],
          price: parseFloat(data.asks[i + 1]).toFixed(2)
        });
      }
      
      setOrderBook({
        bids: formattedBids.sort((a, b) => b.price - a.price),
        asks: formattedAsks.sort((a, b) => a.price - b.price)
      });
    } catch (error) {
      console.error('Error fetching order book:', error);
    }
  }, []);

  const fetchTrades = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/api/trades/1');
      const data = await response.json();
      setTrades(data);
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchOrderBook(), fetchTrades()]);
    };
    
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [fetchOrderBook, fetchTrades]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newOrder,
          price: parseFloat(newOrder.price),
          quantity: parseInt(newOrder.quantity)
        }),
      });
      
      if (response.ok) {
        setMatchAnimation({
          type: newOrder.type,
          price: newOrder.price
        });
        setTimeout(() => setMatchAnimation(null), 1000);

        await Promise.all([fetchOrderBook(), fetchTrades()]);
        setNewOrder({ ...newOrder, price: '', quantity: '' });
      }
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const handleSeedData = (datasetId) => {
    // Refresh the order book after seeding
    fetchOrderBook();
  };

  const OrderExplanation = () => {
    if (!selectedOrder) return null;
    
    const isBid = selectedOrder.type === 'bid';
    const matchingOrders = isBid ? 
      orderBook.asks.filter(ask => parseFloat(ask.price) <= parseFloat(selectedOrder.price)) :
      orderBook.bids.filter(bid => parseFloat(bid.price) >= parseFloat(selectedOrder.price));

    return (
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                      bg-dark-surface p-6 rounded-lg shadow-xl border border-dark-border w-96">
        <h3 className="text-xl font-bold mb-4">Order Analysis</h3>
        <div className="space-y-4">
          <p>
            <span className="font-semibold">Order Type:</span> 
            <span className={isBid ? "text-bid-green" : "text-ask-red"}>
              {isBid ? " BID (Buy)" : " ASK (Sell)"}
            </span>
          </p>
          <p><span className="font-semibold">Price:</span> ${selectedOrder.price}</p>
          <div className="border-t border-dark-border my-4"></div>
          <div>
            <p className="font-semibold mb-2">Matching Analysis:</p>
            {matchingOrders.length > 0 ? (
              <div className="space-y-2">
                <p className="text-green-400 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  This order will match with {matchingOrders.length} order(s)
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {matchingOrders.map(order => (
                    <li key={order.id} className="text-sm">
                      Order at ${order.price}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-yellow-400 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                No immediate matches available at this price
              </p>
            )}
          </div>
        </div>
        <button 
          onClick={() => setSelectedOrder(null)}
          className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded"
        >
          Close
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Order Matching Engine
          </h1>
          <p className="text-gray-400 mt-2">Real-time order book visualization</p>
        </header>

        <DataSeeder onSeedData={handleSeedData} />
        <SystemInfo trades={trades} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-dark-surface rounded-lg p-6 shadow-lg border border-dark-border">
              <h2 className="text-xl font-bold mb-4">Place Order</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    value={newOrder.type}
                    onChange={(e) => setNewOrder({ ...newOrder, type: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded p-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="bid">BID (Buy)</option>
                    <option value="ask">ASK (Sell)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newOrder.price}
                    onChange={(e) => {
                      setNewOrder({ ...newOrder, price: e.target.value });
                      setSelectedOrder({
                        type: newOrder.type,
                        price: e.target.value
                      });
                    }}
                    className="w-full bg-dark-bg border border-dark-border rounded p-2 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Quantity</label>
                  <input
                    type="number"
                    value={newOrder.quantity}
                    onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded p-2 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full py-2 px-4 rounded font-medium transition-colors ${
                    newOrder.type === 'bid' 
                      ? 'bg-bid-green hover:bg-green-600' 
                      : 'bg-ask-red hover:bg-red-600'
                  }`}
                >
                  Place {newOrder.type.toUpperCase()}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-dark-surface rounded-lg p-6 shadow-lg border border-dark-border">
              <h2 className="text-xl font-bold mb-4">Order Book</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-bid-green flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Bids
                  </h3>
                  <div className="space-y-1">
                    {orderBook.bids.map((bid) => (
                      <div
                        key={bid.id}
                        className={`flex justify-between p-2 rounded ${
                          matchAnimation?.type === 'bid' && matchAnimation?.price === bid.price
                            ? 'animate-match'
                            : ''
                        }`}
                      >
                        <span className="text-bid-green">${bid.price}</span>
                        <TrendingUp className="h-5 w-5 text-bid-green" />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 text-ask-red flex items-center gap-2">
                    <TrendingDown className="h-5 w-5" />
                    Asks
                  </h3>
                  <div className="space-y-1">
                    {orderBook.asks.map((ask) => (
                      <div
                        key={ask.id}
                        className={`flex justify-between p-2 rounded ${
                          matchAnimation?.type === 'ask' && matchAnimation?.price === ask.price
                            ? 'animate-match'
                            : ''
                        }`}
                      >
                        <span className="text-ask-red">${ask.price}</span>
                        <TrendingDown className="h-5 w-5 text-ask-red" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-dark-surface rounded-lg p-6 shadow-lg border border-dark-border">
              <h2 className="text-xl font-bold mb-4">Recent Trades</h2>
              <div className="space-y-2">
                {trades.map((trade, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded border ${
                      trade.type === 'bid'
                        ? 'border-bid-green bg-bid-green/10'
                        : 'border-ask-red bg-ask-red/10'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={trade.type === 'bid' ? 'text-bid-green' : 'text-ask-red'}>
                        {trade.type.toUpperCase()}
                      </span>
                      <span>${parseFloat(trade.price).toFixed(2)}</span>
                      <span>x{trade.quantity}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{trade.timestamp}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedOrder && <OrderExplanation />}
    </div>
  );
}

export default App 