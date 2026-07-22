import { useState } from 'react';
import { useNavigate } from "react-router";
import { useAuth } from '../context/AuthContext';

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
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Sign In</h2>
        
        {loginError && <div style={styles.error}>{loginError}</div>}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="loginEmail" style={styles.label}>Email Address</label>
            <input
              id="loginEmail"
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="you@example.com"
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label htmlFor="loginPassword" style={styles.label}>Password</label>
            <input
              id="loginPassword"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
            />
          </div>
          <button type="submit" disabled={loginLoading} style={styles.button}>
            {loginLoading ? 'Authenticating...' : 'Log In'}
          </button>
        </form>
      </div>

      <div style={styles.card}>
        <h2 style={styles.title}>Sign Up</h2>
        
        {signupError && <div style={styles.error}>{signupError}</div>}

        <form onSubmit={handleSignup} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="signupEmail" style={styles.label}>Email Address</label>
            <input
              id="signupEmail"
              type="email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              placeholder="you@example.com"
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label htmlFor="signupPassword" style={styles.label}>Password</label>
            <input
              id="signupPassword"
              type="password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label htmlFor="confirmPassword" style={styles.label}>Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
            />
          </div>
          <button type="submit" disabled={signupLoading} style={styles.button}>
            {signupLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;

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
