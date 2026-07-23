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
        expect(mockNavigate).toHaveBeenCalledWith('/quote-stock');
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
        expect(mockNavigate).toHaveBeenCalledWith('/quote-stock');
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
    const getSignupFormElements = () => {
      const signupEmailInput = screen.getByLabelText('Email Address', { selector: '#signupEmail' });
      const signupPasswordInput = screen.getByLabelText('Password', { selector: '#signupPassword' });
      const signupConfirmPasswordInput = screen.getByLabelText('Confirm Password');
      const registerButton = screen.getByRole('button', { name: /register/i });

      return { signupEmailInput, signupPasswordInput, signupConfirmPasswordInput, registerButton };
    };

    it('should render sign up form with email, password, and confirm password fields', async () => {
      renderLoginPage();

      const signUpTab = screen.getByRole('button', { name: /sign up/i });
      await userEvent.click(signUpTab);

      expect(screen.getByText('Sign Up')).toBeInTheDocument();
      const emailLabels = screen.getAllByText('Email Address');
      const passwordLabels = screen.getAllByText('Password');
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    });

    it('should display error when fields are empty on signup submit', async () => {
      renderLoginPage();

      const signUpTab = screen.getByRole('button', { name: /sign up/i });
      await userEvent.click(signUpTab);

      const registerButton = screen.getByRole('button', { name: /register/i });
      fireEvent.click(registerButton);

      await waitFor(() => {
        expect(screen.getByText('Please fill in all fields.')).toBeInTheDocument();
      });
    });

    it('should display error when passwords do not match', async () => {
      renderLoginPage();

      const signUpTab = screen.getByRole('button', { name: /sign up/i });
      await userEvent.click(signUpTab);

      const { signupEmailInput, signupPasswordInput, signupConfirmPasswordInput, registerButton } = getSignupFormElements();

      await userEvent.type(signupEmailInput, 'newuser@example.com');
      await userEvent.type(signupPasswordInput, 'password123');
      await userEvent.type(signupConfirmPasswordInput, 'differentpassword');
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

      const signUpTab = screen.getByRole('button', { name: /sign up/i });
      await userEvent.click(signUpTab);

      const { signupEmailInput, signupPasswordInput, signupConfirmPasswordInput, registerButton } = getSignupFormElements();

      await userEvent.type(signupEmailInput, 'newuser@example.com');
      await userEvent.type(signupPasswordInput, 'password123');
      await userEvent.type(signupConfirmPasswordInput, 'password123');
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

      const signUpTab = screen.getByRole('button', { name: /sign up/i });
      await userEvent.click(signUpTab);

      const { signupEmailInput, signupPasswordInput, signupConfirmPasswordInput, registerButton } = getSignupFormElements();

      await userEvent.type(signupEmailInput, 'existing@example.com');
      await userEvent.type(signupPasswordInput, 'password123');
      await userEvent.type(signupConfirmPasswordInput, 'password123');
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

      const signUpTab = screen.getByRole('button', { name: /sign up/i });
      await userEvent.click(signUpTab);

      const { signupEmailInput, signupPasswordInput, signupConfirmPasswordInput, registerButton } = getSignupFormElements();

      await userEvent.type(signupEmailInput, 'newuser@example.com');
      await userEvent.type(signupPasswordInput, 'password123');
      await userEvent.type(signupConfirmPasswordInput, 'password123');
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

      const signUpTab = screen.getByRole('button', { name: /sign up/i });
      await userEvent.click(signUpTab);

      const { signupEmailInput, signupPasswordInput, signupConfirmPasswordInput, registerButton } = getSignupFormElements();

      await userEvent.type(signupEmailInput, 'newuser@example.com');
      await userEvent.type(signupPasswordInput, 'password123');
      await userEvent.type(signupConfirmPasswordInput, 'password123');
      fireEvent.click(registerButton);

      await waitFor(() => {
        expect(signupEmailInput).toHaveValue('');
        expect(signupPasswordInput).toHaveValue('');
        expect(signupConfirmPasswordInput).toHaveValue('');
      });
    });
  });

  describe('Form UI Layout', () => {
    it('should display tabbed interface with sign in and sign up tabs', () => {
      renderLoginPage();

      const signInTab = screen.getByRole('button', { name: /sign in/i });
      const signUpTab = screen.getByRole('button', { name: /sign up/i });

      expect(signInTab).toBeInTheDocument();
      expect(signUpTab).toBeInTheDocument();
      expect(signInTab).toHaveClass('active');
      expect(signUpTab).not.toHaveClass('active');
    });

    it('should switch between sign in and sign up forms when tabs are clicked', async () => {
      renderLoginPage();

      const signUpTab = screen.getByRole('button', { name: /sign up/i });

      // Initially, sign in form should be visible
      expect(screen.getByLabelText('Email Address', { selector: '#loginEmail' })).toBeInTheDocument();
      expect(screen.queryByLabelText('Email Address', { selector: '#signupEmail' })).not.toBeInTheDocument();

      // Click sign up tab
      await userEvent.click(signUpTab);

      // Now sign up form should be visible
      expect(screen.getByLabelText('Email Address', { selector: '#signupEmail' })).toBeInTheDocument();
      expect(screen.queryByLabelText('Email Address', { selector: '#loginEmail' })).not.toBeInTheDocument();
    });
  });
});
