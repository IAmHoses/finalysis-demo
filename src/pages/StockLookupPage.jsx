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

        <div style={styles.card}>
          <h2 style={styles.title}>Quote Stock</h2>
          
          {stockLookupError && <div style={styles.error}>{stockLookupError}</div>}

          <form onSubmit={handleStockLookup} style={styles.form}>
            <div style={styles.inputGroup}>
              <label htmlFor="stockTicker" style={styles.label}>Ticker</label>
              <input
                id="stockTicker"
                type="text"
                value={stockTicker}
                onChange={(e) => setStockTicker(e.target.value)}
                placeholder="AAPL"
                style={styles.input}
              />
            </div>
            
            <button type="submit" style={styles.button}>
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
// Inline CSS for clean visual structure out-of-the-box
const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f3f4f6' },
  card: { width: '100%', maxWidth: '400px', padding: '2rem', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  title: { textAlign: 'center', marginBottom: '1.5rem', color: '#1f2937' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.2rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.875rem', fontWeight: '500', color: '#4b5563' },
  input: { padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '1rem' },
  button: { padding: '0.75rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer', fontWeight: '600' },
  error: { padding: '0.5rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '4px', fontSize: '0.875rem', textAlign: 'center' }
};
