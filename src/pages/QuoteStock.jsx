import { useState } from 'react';
import { useNavigate } from "react-router";
import { useAuth } from '../context/AuthContext';
import finnhub from 'finnhub';
import reactLogo from '../assets/react.svg';
import viteLogo from '../assets/vite.svg';
import heroImg from '../assets/hero.png';
import './QuoteStock.css';

function QuoteStock() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const finnhubClient = new finnhub.DefaultApi("d9gkho1r01qq6536nnegd9gkho1r01qq6536nnf0") // Replace this
  const [stockLookupError, setStockLookupError] = useState('');
  const [stockTicker, setStockTicker] = useState('');
  const [stockPrice, setStockPrice] = useState('');

  const handleLogout = async (e) => {
    e.preventDefault();

    const result = await logout();
    if (result.success) {
      navigate('/login'); // Redirect to QuoteStock after successful login
    } else {
      alert(`Logout failed: ${result.message}`);
    }
  };

  const handleStockLookup = async (e) => {
    e.preventDefault();

    if (!stockTicker) {
      alert('Please enter a stock ticker symbol.');
      return;
    }    
    try {
      // Get the stock price using Finnhub API
      finnhubClient.quote(stockTicker, (error, data, response) => {
          if (!data) {
            throw new Error('Stock not found via finnhub API');
          }
          console.log(data);
          setStockPrice(data.o);
    });
      // alert(`The current price of ${stockTicker} is $${stockPrice}`);
    } catch (error) {
      alert(`Error fetching stock price: ${error.message}`);
    }
  };

  return (
    <div className="stock-container">
      <div className="stock-wrapper">
        <div className="stock-header">
          <div className="hero">
            <img src={heroImg} className="base" width="170" height="179" alt="" />
            <img src={reactLogo} className="framework" alt="React logo" />
            <img src={viteLogo} className="vite" alt="Vite logo" />
          </div>
          <h1 className="stock-app-title">Quote Stock</h1>
          <p className="stock-subtitle">Search for real-time stock quotes</p>
        </div>

        <div className="stock-result">
          <h2 className="stock-result-title">Opening Price: {stockPrice}</h2>
        </div>

        <div className="stock-card">
          <div className="stock-content">
            {stockLookupError && <div className="stock-error">{stockLookupError}</div>}

            <form onSubmit={handleStockLookup} className="stock-form">
              <div className="stock-input-group">
                <label htmlFor="stockTicker" className="stock-label">Ticker</label>
                <div className="stock-input-wrapper">
                  <span className="stock-input-icon">📈</span>
                  <input
                    id="stockTicker"
                    type="text"
                    value={stockTicker}
                    onChange={(e) => setStockTicker(e.target.value)}
                    placeholder="AAPL"
                    className="stock-input"
                  />
                </div>
              </div>

              <button type="submit" className="stock-button">
                Search
              </button>
            </form>
          </div>
        </div>

        <button
          type="button"
          className="stock-logout-button"
          onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </div>
  )
}

export default QuoteStock
