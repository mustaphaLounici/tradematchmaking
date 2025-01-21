import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [newOrder, setNewOrder] = useState({
    type: 'bid',
    itemId: '1',
    price: '',
    quantity: '',
    userId: '1'
  });

  useEffect(() => {
    fetchOrderBook();
    const interval = setInterval(fetchOrderBook, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrderBook = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/orderbook/1');
      const data = await response.json();
      setOrderBook(data);
    } catch (error) {
      console.error('Error fetching order book:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOrder),
      });
      fetchOrderBook();
      setNewOrder({ ...newOrder, price: '', quantity: '' });
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  return (
    <div className="App">
      <h1>Order Matching Demo</h1>
      
      <div className="order-form">
        <h2>Create New Order</h2>
        <form onSubmit={handleSubmit}>
          <select
            value={newOrder.type}
            onChange={(e) => setNewOrder({ ...newOrder, type: e.target.value })}
          >
            <option value="bid">Bid</option>
            <option value="ask">Ask</option>
          </select>
          
          <input
            type="number"
            placeholder="Price"
            value={newOrder.price}
            onChange={(e) => setNewOrder({ ...newOrder, price: e.target.value })}
          />
          
          <input
            type="number"
            placeholder="Quantity"
            value={newOrder.quantity}
            onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })}
          />
          
          <button type="submit">Place Order</button>
        </form>
      </div>

      <div className="order-book">
        <div className="bids">
          <h2>Bids</h2>
          {orderBook.bids.map((bid, i) => (
            <div key={i} className="order">
              <span>Price: {bid[1]}</span>
              <span>Order ID: {bid[0]}</span>
            </div>
          ))}
        </div>

        <div className="asks">
          <h2>Asks</h2>
          {orderBook.asks.map((ask, i) => (
            <div key={i} className="order">
              <span>Price: {ask[1]}</span>
              <span>Order ID: {ask[0]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App; 