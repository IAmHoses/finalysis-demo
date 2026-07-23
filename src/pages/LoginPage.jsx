import { useState } from 'react';
import { useNavigate } from "react-router";
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [signupError, setSignupError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    setLoginLoading(true);
    if (!loginEmail || !loginPassword) {
      setLoginError('Please fill in all fields.');
      setLoginLoading(false);
      return;
    }

    const result = await login(loginEmail, loginPassword);
    if (result.success) {
      setLoginError('');
      setLoginEmail('');
      setLoginPassword('');
      // Redirect to StockLookupPage after successful login
      navigate('/stock-lookup');
    } else {
      setLoginError(result.message);
    }
    setLoginLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError('');
    
    setSignupLoading(true);
    if (!signupEmail || !signupPassword || !confirmPassword) {
      setSignupError('Please fill in all fields.');
      setSignupLoading(false);
      return;
    }
    if ((signupEmail && signupPassword && confirmPassword)
        && (signupPassword !== confirmPassword)) {
      setSignupError('Passwords do not match.');
      setSignupLoading(false);
      return;
    }

    const result = await signup(signupEmail, signupPassword);
    if (result.success) {
      setSignupError('');
      setSignupEmail('');
      setSignupPassword('');
      setConfirmPassword('');
      // Alert user of successful registration and prompt them to log in
      alert('Registration successful! Please log in.');
    } else {
      setSignupError(result.message);
    }
    setSignupLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Sign In</h2>
        
        {loginError && <div className="login-error">{loginError}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="login-input-group">
            <label htmlFor="loginEmail" className="login-label">Email Address</label>
            <input
              id="loginEmail"
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="you@example.com"
              className="login-input"
            />
          </div>
          <div className="login-input-group">
            <label htmlFor="loginPassword" className="login-label">Password</label>
            <input
              id="loginPassword"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="••••••••"
              className="login-input"
            />
          </div>
          <button type="submit" disabled={loginLoading} className="login-button">
            {loginLoading ? 'Authenticating...' : 'Log In'}
          </button>
        </form>
      </div>

      <div className="login-card">
        <h2 className="login-title">Sign Up</h2>
        
        {signupError && <div className="login-error">{signupError}</div>}

        <form onSubmit={handleSignup} className="login-form">
          <div className="login-input-group">
            <label htmlFor="signupEmail" className="login-label">Email Address</label>
            <input
              id="signupEmail"
              type="email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              placeholder="you@example.com"
              className="login-input"
            />
          </div>
          <div className="login-input-group">
            <label htmlFor="signupPassword" className="login-label">Password</label>
            <input
              id="signupPassword"
              type="password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              placeholder="••••••••"
              className="login-input"
            />
          </div>
          <div className="login-input-group">
            <label htmlFor="confirmPassword" className="login-label">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="login-input"
            />
          </div>
          <button type="submit" disabled={signupLoading} className="login-button">
            {signupLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
