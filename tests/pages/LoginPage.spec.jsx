import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../../src/pages/LoginPage';
import { AuthProvider } from '../../src/context/AuthContext';

// Mock fetch
global.fetch = vi.fn();

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
  ...vi.importActual('react-router'),
}));

const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Sign In Form', () => {
    it('should render sign in form with email and password fields', () => {
      renderLoginPage();

      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address', { selector: '#loginEmail' })).toBeInTheDocument();
      expect(screen.getByLabelText('Password', { selector: '#loginPassword' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    });

    it('should display error when fields are empty on login submit', async () => {
      renderLoginPage();

      const loginButton = screen.getAllByRole('button', { name: /log in/i })[0];
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Please fill in all fields.')).toBeInTheDocument();
      });
    });

    it('should successfully log in with valid credentials', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Login successful' }),
      });

      renderLoginPage();

      const loginEmailInput = screen.getByLabelText('Email Address', { selector: '#loginEmail' });
      const loginPasswordInput = screen.getByLabelText('Password', { selector: '#loginPassword' });
      const loginButton = screen.getAllByRole('button', { name: /log in/i })[0];

      await userEvent.type(loginEmailInput, 'test@example.com');
      await userEvent.type(loginPasswordInput, 'password123');
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/stock-lookup');
      });
    });

    it('should display error message on login failure', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid credentials.' }),
      });

      renderLoginPage();

      const loginEmailInputs = screen.getAllByPlaceholderText('you@example.com');
      const loginPasswordInputs = screen.getAllByPlaceholderText('••••••••');
      const loginButton = screen.getAllByRole('button', { name: /log in/i })[0];

      await userEvent.type(loginEmailInputs[0], 'test@example.com');
      await userEvent.type(loginPasswordInputs[0], 'wrongpassword');
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials.')).toBeInTheDocument();
      });
    });

    it('should show loading state while authenticating', async () => {
      fetch.mockImplementationOnce(() =>
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ message: 'Login successful' }),
        }), 100))
      );

      renderLoginPage();

      const loginEmailInputs = screen.getAllByPlaceholderText('you@example.com');
      const loginPasswordInputs = screen.getAllByPlaceholderText('••••••••');
      const loginButton = screen.getAllByRole('button', { name: /log in/i })[0];

      await userEvent.type(loginEmailInputs[0], 'test@example.com');
      await userEvent.type(loginPasswordInputs[0], 'password123');
      fireEvent.click(loginButton);

      expect(screen.getByRole('button', { name: /authenticating/i })).toBeInTheDocument();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/stock-lookup');
      });
    });

    it('should clear form on successful login', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Login successful' }),
      });

      renderLoginPage();

      const loginEmailInputs = screen.getAllByPlaceholderText('you@example.com');
      const loginPasswordInputs = screen.getAllByPlaceholderText('••••••••');
      const loginButton = screen.getAllByRole('button', { name: /log in/i })[0];

      await userEvent.type(loginEmailInputs[0], 'test@example.com');
      await userEvent.type(loginPasswordInputs[0], 'password123');
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(loginEmailInputs[0].value).toBe('');
        expect(loginPasswordInputs[0].value).toBe('');
      });
    });
  });

  describe('Sign Up Form', () => {
    it('should render sign up form with email, password, and confirm password fields', () => {
      renderLoginPage();

      expect(screen.getByText('Sign Up')).toBeInTheDocument();
      const emailLabels = screen.getAllByText('Email Address');
      const passwordLabels = screen.getAllByText('Password');
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    });

    it('should display error when fields are empty on signup submit', async () => {
      renderLoginPage();

      const registerButton = screen.getByRole('button', { name: /register/i });
      fireEvent.click(registerButton);

      await waitFor(() => {
        expect(screen.getByText('Please fill in all fields.')).toBeInTheDocument();
      });
    });

    it('should display error when passwords do not match', async () => {
      renderLoginPage();

      const signupEmailInputs = screen.getAllByPlaceholderText('you@example.com');
      const signupPasswordInputs = screen.getAllByPlaceholderText('••••••••');
      const signupConfirmPasswordInputs = screen.getAllByPlaceholderText('••••••••');
      const registerButton = screen.getByRole('button', { name: /register/i });

      await userEvent.type(signupEmailInputs[1], 'newuser@example.com');
      await userEvent.type(signupPasswordInputs[1], 'password123');
      await userEvent.type(signupConfirmPasswordInputs[2], 'differentpassword');
      fireEvent.click(registerButton);

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
      });
    });

    it('should successfully sign up with valid credentials', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Signup successful' }),
      });

      global.alert = vi.fn();

      renderLoginPage();

      const signupEmailInputs = screen.getAllByPlaceholderText('you@example.com');
      const signupPasswordInputs = screen.getAllByPlaceholderText('••••••••');
      const signupConfirmPasswordInputs = screen.getAllByPlaceholderText('••••••••');
      const registerButton = screen.getByRole('button', { name: /register/i });

      await userEvent.type(signupEmailInputs[1], 'newuser@example.com');
      await userEvent.type(signupPasswordInputs[1], 'password123');
      await userEvent.type(signupConfirmPasswordInputs[2], 'password123');
      fireEvent.click(registerButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Registration successful! Please log in.');
      });
    });

    it('should display error message on signup failure', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'User already exists.' }),
      });

      renderLoginPage();

      const signupEmailInputs = screen.getAllByPlaceholderText('you@example.com');
      const signupPasswordInputs = screen.getAllByPlaceholderText('••••••••');
      const signupConfirmPasswordInputs = screen.getAllByPlaceholderText('••••••••');
      const registerButton = screen.getByRole('button', { name: /register/i });

      await userEvent.type(signupEmailInputs[1], 'existing@example.com');
      await userEvent.type(signupPasswordInputs[1], 'password123');
      await userEvent.type(signupConfirmPasswordInputs[2], 'password123');
      fireEvent.click(registerButton);

      await waitFor(() => {
        expect(screen.getByText('User already exists.')).toBeInTheDocument();
      });
    });

    it('should show loading state while registering', async () => {
      fetch.mockImplementationOnce(() =>
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ message: 'Signup successful' }),
        }), 100))
      );

      global.alert = vi.fn();

      renderLoginPage();

      const signupEmailInputs = screen.getAllByPlaceholderText('you@example.com');
      const signupPasswordInputs = screen.getAllByPlaceholderText('••••••••');
      const signupConfirmPasswordInputs = screen.getAllByPlaceholderText('••••••••');
      const registerButton = screen.getByRole('button', { name: /register/i });

      await userEvent.type(signupEmailInputs[1], 'newuser@example.com');
      await userEvent.type(signupPasswordInputs[1], 'password123');
      await userEvent.type(signupConfirmPasswordInputs[2], 'password123');
      fireEvent.click(registerButton);

      expect(screen.getByRole('button', { name: /registering/i })).toBeInTheDocument();

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Registration successful! Please log in.');
      });
    });

    it('should clear form on successful signup', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Signup successful' }),
      });

      global.alert = vi.fn();

      renderLoginPage();

      const signupEmailInputs = screen.getAllByPlaceholderText('you@example.com');
      const signupPasswordInputs = screen.getAllByPlaceholderText('••••••••');
      const signupConfirmPasswordInputs = screen.getAllByPlaceholderText('••••••••');
      const registerButton = screen.getByRole('button', { name: /register/i });

      await userEvent.type(signupEmailInputs[1], 'newuser@example.com');
      await userEvent.type(signupPasswordInputs[1], 'password123');
      await userEvent.type(signupConfirmPasswordInputs[2], 'password123');
      fireEvent.click(registerButton);

      await waitFor(() => {
        expect(signupEmailInputs[1].value).toBe('');
        expect(signupPasswordInputs[1].value).toBe('');
        expect(signupConfirmPasswordInputs[2].value).toBe('');
      });
    });
  });

  describe('Form UI Layout', () => {
    it('should display both sign in and sign up cards side by side', () => {
      renderLoginPage();

      const signInCard = screen.getByText('Sign In').closest('div');
      const signUpCard = screen.getByText('Sign Up').closest('div');

      expect(signInCard).toBeInTheDocument();
      expect(signUpCard).toBeInTheDocument();
      expect(signInCard).not.toEqual(signUpCard);
    });
  });
});
