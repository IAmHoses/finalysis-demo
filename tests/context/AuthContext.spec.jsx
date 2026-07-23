import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';

// Mock fetch
global.fetch = vi.fn();

describe('AuthContext', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('signup', () => {
    it('should successfully sign up a new user', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Signup successful' }),
      });

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      let signupResult;
      await act(async () => {
        signupResult = await result.current.signup('test@example.com', 'password123');
      });

      expect(signupResult.success).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/signup',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
        })
      );
    });

    it('should handle signup error from backend', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'User already exists.' }),
      });

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      let signupResult;
      await act(async () => {
        signupResult = await result.current.signup('existing@example.com', 'password123');
      });

      expect(signupResult.success).toBe(false);
      expect(signupResult.message).toBe('User already exists.');
    });

    it('should handle network errors during signup', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      let signupResult;
      await act(async () => {
        signupResult = await result.current.signup('test@example.com', 'password123');
      });

      expect(signupResult.success).toBe(false);
      expect(signupResult.message).toBe('Network error');
    });
  });

  describe('login', () => {
    it('should successfully log in a user', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Login successful', user: 'test@example.com' }),
      });

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'password123');
      });

      expect(loginResult.success).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/login',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
        })
      );
    });

    it('should handle login error with invalid credentials', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid credentials.' }),
      });

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'wrongpassword');
      });

      expect(loginResult.success).toBe(false);
      expect(loginResult.message).toBe('Invalid credentials.');
    });

    it('should handle user not found error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'User not found.' }),
      });

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('nonexistent@example.com', 'password123');
      });

      expect(loginResult.success).toBe(false);
      expect(loginResult.message).toBe('User not found.');
    });

    it('should handle network errors during login', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'password123');
      });

      expect(loginResult.success).toBe(false);
      expect(loginResult.message).toBe('Network error');
    });
  });

  describe('logout', () => {
    it('should successfully log out a user', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Logout successful' }),
      });

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      let logoutResult;
      await act(async () => {
        logoutResult = await result.current.logout();
      });

      expect(logoutResult.success).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/logout',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should handle logout error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Logout failed.' }),
      });

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      let logoutResult;
      await act(async () => {
        logoutResult = await result.current.logout();
      });

      expect(logoutResult.success).toBe(false);
      expect(logoutResult.message).toBe('Logout failed.');
    });

    it('should handle network errors during logout', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      let logoutResult;
      await act(async () => {
        logoutResult = await result.current.logout();
      });

      expect(logoutResult.success).toBe(false);
      expect(logoutResult.message).toBe('Network error');
    });
  });

  describe('useAuth hook', () => {
    it('should provide signup, login, and logout functions', () => {
      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(typeof result.current.signup).toBe('function');
      expect(typeof result.current.login).toBe('function');
      expect(typeof result.current.logout).toBe('function');
    });
  });
});
