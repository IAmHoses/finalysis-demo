import { useState } from 'react';
import { useNavigate } from "react-router";
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupShowPassword, setSignupShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmShowPassword, setConfirmShowPassword] = useState(false);
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
      navigate('/quote-stock');
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
      alert('Registration successful! Please log in.');
    } else {
      setSignupError(result.message);
    }
    setSignupLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-header">
          <h1 className="login-app-title">Finalysis</h1>
          <p className="login-subtitle">Sign in or create an account to get started</p>
        </div>

        <div className="login-card">
          <div className="login-tabs">
            <button
              className={`login-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              Sign In
            </button>
            <button
              className={`login-tab ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => setActiveTab('signup')}
            >
              Sign Up
            </button>
          </div>

          {activeTab === 'login' && (
            <div className="login-tab-content">
              {loginError && <div className="login-error">{loginError}</div>}

              <form onSubmit={handleLogin} className="login-form">
                <div className="login-input-group">
                  <label htmlFor="loginEmail" className="login-label">Email Address</label>
                  <div className="login-input-wrapper">
                    <span className="login-input-icon">✉️</span>
                    <input
                      id="loginEmail"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="login-input"
                    />
                  </div>
                </div>
                <div className="login-input-group">
                  <label htmlFor="loginPassword" className="login-label">Password</label>
                  <div className="login-input-wrapper">
                    <span className="login-input-icon">🔒</span>
                    <input
                      id="loginPassword"
                      type={loginShowPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="login-input"
                    />
                    <button
                      type="button"
                      className="login-password-toggle"
                      onClick={() => setLoginShowPassword(!loginShowPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {loginShowPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loginLoading} className="login-button">
                  {loginLoading ? (
                    <>
                      <span className="login-spinner"></span>
                      Authenticating...
                    </>
                  ) : (
                    'Log In'
                  )}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'signup' && (
            <div className="login-tab-content">
              {signupError && <div className="login-error">{signupError}</div>}

              <form onSubmit={handleSignup} className="login-form">
                <div className="login-input-group">
                  <label htmlFor="signupEmail" className="login-label">Email Address</label>
                  <div className="login-input-wrapper">
                    <span className="login-input-icon">✉️</span>
                    <input
                      id="signupEmail"
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="login-input"
                    />
                  </div>
                </div>
                <div className="login-input-group">
                  <label htmlFor="signupPassword" className="login-label">Password</label>
                  <div className="login-input-wrapper">
                    <span className="login-input-icon">🔒</span>
                    <input
                      id="signupPassword"
                      type={signupShowPassword ? 'text' : 'password'}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="••••••••"
                      className="login-input"
                    />
                    <button
                      type="button"
                      className="login-password-toggle"
                      onClick={() => setSignupShowPassword(!signupShowPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {signupShowPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>
                <div className="login-input-group">
                  <label htmlFor="confirmPassword" className="login-label">Confirm Password</label>
                  <div className="login-input-wrapper">
                    <span className="login-input-icon">🔒</span>
                    <input
                      id="confirmPassword"
                      type={confirmShowPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="login-input"
                    />
                    <button
                      type="button"
                      className="login-password-toggle"
                      onClick={() => setConfirmShowPassword(!confirmShowPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {confirmShowPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={signupLoading} className="login-button">
                  {signupLoading ? (
                    <>
                      <span className="login-spinner"></span>
                      Registering...
                    </>
                  ) : (
                    'Register'
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
