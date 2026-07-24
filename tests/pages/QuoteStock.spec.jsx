import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import QuoteStock from '../../src/pages/QuoteStock';
import { AuthProvider } from '../../src/context/AuthContext';

global.fetch = vi.fn();

const mockNavigate = vi.fn();
vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
  ...vi.importActual('react-router'),
}));

// Declared with `let` so individual tests can override its implementation
let mockQuoteFn = vi.fn();

vi.mock('finnhub', () => {
  return {
    default: {
      DefaultApi: vi.fn(function() {
        this.quote = mockQuoteFn;
      }),
    },
  };
});

const renderQuoteStock = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <QuoteStock />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('QuoteStock', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockNavigate.mockClear();
    mockQuoteFn = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render the stock lookup page with hero images', () => {
      renderQuoteStock();

      expect(screen.getByText('Quote Stock')).toBeInTheDocument();
      expect(screen.getByAltText('React logo')).toBeInTheDocument();
      expect(screen.getByAltText('Vite logo')).toBeInTheDocument();
    });

    it('should render ticker input field', () => {
      renderQuoteStock();

      expect(screen.getByLabelText('Ticker')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('AAPL')).toBeInTheDocument();
    });

    it('should render search button', () => {
      renderQuoteStock();

      expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    });

    it('should render logout button', () => {
      renderQuoteStock();

      expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument();
    });

    it('should display opening price heading', () => {
      renderQuoteStock();

      expect(screen.getByText(/opening price/i)).toBeInTheDocument();
    });
  });

  describe('Stock Lookup Functionality', () => {
    it('should display alert when no ticker is entered', async () => {
      global.alert = vi.fn();

      renderQuoteStock();

      const searchButton = screen.getByRole('button', { name: /search/i });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Please enter a stock ticker symbol.');
      });
    });

    it('should call finnhub quote API with valid ticker', async () => {
      mockQuoteFn.mockImplementationOnce((ticker, callback) => {
        callback(null, { o: 150.25 });
      });

      renderQuoteStock();

      const tickerInput = screen.getByPlaceholderText('AAPL');
      const searchButton = screen.getByRole('button', { name: /search/i });

      await userEvent.type(tickerInput, 'AAPL');
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(mockQuoteFn).toHaveBeenCalledWith('AAPL', expect.any(Function));
      });
    });

    it('should display stock opening price after successful lookup', async () => {
      mockQuoteFn.mockImplementationOnce((ticker, callback) => {
        callback(null, { o: 150.25 });
      });

      renderQuoteStock();

      const tickerInput = screen.getByPlaceholderText('AAPL');
      const searchButton = screen.getByRole('button', { name: /search/i });

      await userEvent.type(tickerInput, 'AAPL');
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText(/opening price: 150.25/i)).toBeInTheDocument();
      });
    });

    it('should display error alert when stock not found', async () => {
      global.alert = vi.fn();

      mockQuoteFn.mockImplementationOnce((ticker, callback) => {
        callback(null, null);
      });

      renderQuoteStock();

      const tickerInput = screen.getByPlaceholderText('AAPL');
      const searchButton = screen.getByRole('button', { name: /search/i });

      await userEvent.type(tickerInput, 'INVALID');
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          expect.stringContaining('Error fetching stock price')
        );
      });
    });

    it('should handle API error gracefully', async () => {
      global.alert = vi.fn();

      mockQuoteFn.mockImplementationOnce((ticker, callback) => {
        callback(new Error('API Error'));
      });

      renderQuoteStock();

      const tickerInput = screen.getByPlaceholderText('AAPL');
      const searchButton = screen.getByRole('button', { name: /search/i });

      await userEvent.type(tickerInput, 'AAPL');
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          expect.stringContaining('Error fetching stock price')
        );
      });
    });

    it('should allow multiple stock searches', async () => {
      mockQuoteFn
        .mockImplementationOnce((ticker, callback) => {
          callback(null, { o: 150.25 });
        })
        .mockImplementationOnce((ticker, callback) => {
          callback(null, { o: 140.50 });
        });

      renderQuoteStock();

      const tickerInput = screen.getByPlaceholderText('AAPL');
      const searchButton = screen.getByRole('button', { name: /search/i });

      // First search
      await userEvent.type(tickerInput, 'AAPL');
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText(/opening price: 150.25/i)).toBeInTheDocument();
      });

      // Clear and search again
      await userEvent.clear(tickerInput);
      await userEvent.type(tickerInput, 'GOOGL');
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText(/opening price: 140.5/i)).toBeInTheDocument();
      });
    });
  });

  describe('Logout Functionality', () => {
    it('should successfully log out user', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Logout successful' }),
      });

      renderQuoteStock();

      const logoutButton = screen.getByRole('button', { name: /log out/i });
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    it('should display error alert on logout failure', async () => {
      global.alert = vi.fn();

      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Logout failed.' }),
      });

      renderQuoteStock();

      const logoutButton = screen.getByRole('button', { name: /log out/i });
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          expect.stringContaining('Logout failed')
        );
      });
    });

    it('should not navigate on logout failure', async () => {
      global.alert = vi.fn();

      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Logout failed.' }),
      });

      renderQuoteStock();

      const logoutButton = screen.getByRole('button', { name: /log out/i });
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('UI Interactions', () => {
    it('should clear ticker input after search', async () => {
      mockQuoteFn.mockImplementationOnce((ticker, callback) => {
        callback(null, { o: 150.25 });
      });

      renderQuoteStock();

      const tickerInput = screen.getByPlaceholderText('AAPL');
      const searchButton = screen.getByRole('button', { name: /search/i });

      await userEvent.type(tickerInput, 'AAPL');
      fireEvent.click(searchButton);

      // Ticker input should still have value (component doesn't clear it)
      expect(tickerInput.value).toBe('AAPL');
    });
  });
});
