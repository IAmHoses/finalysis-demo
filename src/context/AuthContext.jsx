import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      // Optional: Decode token or fetch user profile data from your API here
      setUser({ email: localStorage.getItem('user_email') || '' });
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user_email');
      setUser(null);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      // Replace with your real backend API route (e.g., Express, Laravel, etc.)
      const response = await fetch('https://example.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Store the token and update user profile state
      setToken(data.token);
      localStorage.setItem('user_email', email);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
