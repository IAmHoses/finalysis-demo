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

    // setStockTicker('AAPL'); // For testing purposes, you can set a default ticker symbol
    // if (!stockTicker) {
    //   alert('Please enter a stock ticker symbol.');
    //   return;
    // }
    try {
      // Basic financials
      finnhubClient.companyBasicFinancials("AAPL", "margin", (error, data, response) => {
          console.log(data)
    });
      // const response = await fetch(`https://api.example.com/stocks/${stockTicker}`);
      // const data = await response.json();

      // if (!response.ok) {
      //   throw new Error('Stock not found');
      // }
      // setStockPrice(data.price);
      // alert(`The current price of ${stockTicker} is $${stockPrice}`);
    } catch (error) {
      alert(`Error fetching stock price: ${error.message}`);
    }
  };

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={handleStockLookup}
        >
          Lookup Stock
        </button>
      </section>

      <div className="ticks"></div>

      <section id="spacer">
        <button onClick={handleLogout}>
          Logout
        </button>
      </section>
    </>
  )
}

export default StockLookupPage
