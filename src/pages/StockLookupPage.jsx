import { useState } from 'react';
import { useNavigate } from "react-router";
import { useAuth } from '../context/AuthContext';
import finnhub from 'finnhub';
import reactLogo from '../assets/react.svg';
import viteLogo from '../assets/vite.svg';
import heroImg from '../assets/hero.png';
import './StockLookupPage.css';

function StockLookupPage() {
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
      navigate('/login'); // Redirect to StockLookupPage after successful login
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
    <>
      <div className="ticks"></div>
      
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>

        <section id="spacer"></section>

        <div className="stock-card">
          <h2 className="stock-title">Quote Stock</h2>
          
          {stockLookupError && <div className="stock-error">{stockLookupError}</div>}

          <form onSubmit={handleStockLookup} className="stock-form">
            <div className="stock-input-group">
              <label htmlFor="stockTicker" className="stock-label">Ticker</label>
              <input
                id="stockTicker"
                type="text"
                value={stockTicker}
                onChange={(e) => setStockTicker(e.target.value)}
                placeholder="AAPL"
                className="stock-input"
              />
            </div>
            
            <button type="submit" className="stock-button">
              Search
            </button>
          </form>
        </div>
        <div>
          <h1>Opening Price: {stockPrice}</h1>
        </div>

        <section id="spacer"></section>
        
        <button
          type="button"
          className="counter"
          onClick={handleLogout}>
          Log Out
        </button>
      </section>

      <div className="ticks"></div>
    </>
  )
}

export default StockLookupPage
