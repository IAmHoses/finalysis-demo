import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

  const signup = async (email, password) => {
    try { // Call backend API to create a new user
      const response = await fetch('http://localhost:3000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) { // throw backend user registration error
        throw new Error(data.message || 'User registration failed');
      } 
      if (response.ok) { // Return success to LoginPage for alert
        return { success: true };
      }
      return { success: false, message: 'Unknown error during signup' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const login = async (email, password) => {
    try { // Call backend API to authenticate user
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) { // throw backend user authentication error
        throw new Error(data.message || 'User authentication failed');
      }
      if (response.ok) { // Return success to LoginPage for redirect -> StockLookupPage
        return { success: true };
      }
      return { success: false, message: 'Unknown error during login' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    try { // Call backend API to log out user
      const response = await fetch('http://localhost:3000/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();

      if (!response.ok) { // throw backend user logout error
        throw new Error(data.message || 'User logout failed');
      }
      if (response.ok) { // Return success to StockLookupPage for redirect -> LoginPage
        return { success: true };
      }
      return { success: false, message: 'Unknown error during logout' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
