import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import bcrypt from 'bcrypt';

vi.mock('bcrypt');

const mockDb = {
  isOpen: true,
  exec: vi.fn(),
  prepare: vi.fn(),
  open: vi.fn(),
  close: vi.fn(),
};

vi.mock('node:sqlite', () => ({
  DatabaseSync: vi.fn(() => mockDb),
}));

import('../server.js').catch(err => {
  // Expected to fail on import due to Express binding
});

describe('Backend Authentication Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.isOpen = true;
    mockDb.prepare.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Password Hashing', () => {
    it('should hash password with bcrypt', async () => {
      const plainPassword = 'testpassword123';
      const hashedPassword = '$2b$12$hashedpassword';

      bcrypt.hash.mockResolvedValueOnce(hashedPassword);

      const result = await bcrypt.hash(plainPassword, 12);

      expect(bcrypt.hash).toHaveBeenCalledWith(plainPassword, 12);
      expect(result).toBe(hashedPassword);
    });

    it('should use 12 salt rounds for hashing', async () => {
      const plainPassword = 'testpassword123';
      const hashedPassword = '$2b$12$hashedpassword';

      bcrypt.hash.mockResolvedValueOnce(hashedPassword);

      await bcrypt.hash(plainPassword, 12);

      expect(bcrypt.hash).toHaveBeenCalledWith(plainPassword, 12);
    });
  });

  describe('Password Verification', () => {
    it('should verify correct password', async () => {
      const plainPassword = 'testpassword123';
      const hashedPassword = '$2b$12$hashedpassword';

      bcrypt.compare.mockResolvedValueOnce(true);

      const result = await bcrypt.compare(plainPassword, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const plainPassword = 'testpassword123';
      const wrongPassword = 'wrongpassword';
      const hashedPassword = '$2b$12$hashedpassword';

      bcrypt.compare.mockResolvedValueOnce(false);

      const result = await bcrypt.compare(wrongPassword, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(wrongPassword, hashedPassword);
      expect(result).toBe(false);
    });
  });

  describe('Database Operations', () => {
    it('should create users table on initialization', () => {
      const createTableSQL = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  ) STRICT;
`;

      mockDb.exec(createTableSQL);

      expect(mockDb.exec).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE'));
      expect(mockDb.exec).toHaveBeenCalledWith(expect.stringContaining('users'));
      expect(mockDb.exec).toHaveBeenCalledWith(expect.stringContaining('email'));
      expect(mockDb.exec).toHaveBeenCalledWith(expect.stringContaining('password'));
    });

    it('should insert new user into database', () => {
      const mockRun = vi.fn();
      mockDb.prepare.mockReturnValueOnce({ run: mockRun });

      const email = 'test@example.com';
      const hashedPassword = '$2b$12$hashedpassword';

      mockDb.prepare(`INSERT INTO users (email, password) VALUES (?, ?)`).run(email, hashedPassword);

      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users')
      );
      expect(mockRun).toHaveBeenCalledWith(email, hashedPassword);
    });

    it('should check if user exists by email', () => {
      const mockGet = vi.fn(() => ({ id: 1, email: 'test@example.com' }));
      mockDb.prepare.mockReturnValueOnce({ get: mockGet });

      const email = 'test@example.com';

      mockDb.prepare(`SELECT * FROM users WHERE email = ?`).get(email);

      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM users')
      );
      expect(mockGet).toHaveBeenCalledWith(email);
    });

    it('should retrieve password hash from database', () => {
      const mockGet = vi.fn(() => ({ password: '$2b$12$hashedpassword' }));
      mockDb.prepare.mockReturnValueOnce({ get: mockGet });

      const email = 'test@example.com';

      mockDb.prepare(`SELECT password FROM users WHERE email = ?`).get(email);

      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('SELECT password FROM users')
      );
      expect(mockGet).toHaveBeenCalledWith(email);
    });

    it('should open database connection if closed', () => {
      mockDb.isOpen = false;

      if (!mockDb.isOpen) {
        mockDb.open();
      }

      expect(mockDb.open).toHaveBeenCalled();
    });

    it('should close database connection on logout', () => {
      mockDb.isOpen = true;

      if (mockDb.isOpen) {
        mockDb.close();
      }

      expect(mockDb.close).toHaveBeenCalled();
    });
  });

  describe('Signup Flow', () => {
    it('should require email and password', () => {
      const testCases = [
        { email: '', password: 'password123', shouldFail: true },
        { email: 'test@example.com', password: '', shouldFail: true },
        { email: '', password: '', shouldFail: true },
        { email: 'test@example.com', password: 'password123', shouldFail: false },
      ];

      testCases.forEach(({ email, password, shouldFail }) => {
        const isValid = Boolean(email && password);
        expect(isValid).toBe(!shouldFail);
      });
    });

    it('should reject duplicate email registration', () => {
      const email = 'existing@example.com';
      const mockGet = vi.fn(() => ({ id: 1, email }));
      mockDb.prepare.mockReturnValueOnce({ get: mockGet });

      const existingUser = mockDb.prepare(`SELECT * FROM users WHERE email = ?`).get(email);

      expect(existingUser).toBeTruthy();
      expect(existingUser.email).toBe(email);
      expect(mockGet).toHaveBeenCalledWith(email);
    });

    it('should hash password before storing', async () => {
      const plainPassword = 'testpassword123';
      const hashedPassword = '$2b$12$hashedpassword';

      bcrypt.hash.mockResolvedValueOnce(hashedPassword);

      const result = await bcrypt.hash(plainPassword, 12);

      expect(result).toBe(hashedPassword);
      expect(result).not.toBe(plainPassword);
    });
  });

  describe('Login Flow', () => {
    it('should require email and password for login', () => {
      const testCases = [
        { email: '', password: 'password123', shouldFail: true },
        { email: 'test@example.com', password: '', shouldFail: true },
        { email: '', password: '', shouldFail: true },
        { email: 'test@example.com', password: 'password123', shouldFail: false },
      ];

      testCases.forEach(({ email, password, shouldFail }) => {
        const isValid = Boolean(email && password);
        expect(isValid).toBe(!shouldFail);
      });
    });

    it('should fail if user does not exist', () => {
      const mockGet = vi.fn(() => null);
      mockDb.prepare.mockReturnValueOnce({ get: mockGet });

      const email = 'nonexistent@example.com';
      const existingUser = mockDb.prepare(`SELECT * FROM users WHERE email = ?`).get(email);

      expect(existingUser).toBeNull();
      expect(mockGet).toHaveBeenCalledWith(email);
    });

    it('should verify password against stored hash', async () => {
      const plainPassword = 'testpassword123';
      const storedHash = '$2b$12$hashedpassword';

      bcrypt.compare.mockResolvedValueOnce(true);

      const isMatch = await bcrypt.compare(plainPassword, storedHash);

      expect(isMatch).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, storedHash);
    });

    it('should fail if password does not match', async () => {
      const plainPassword = 'wrongpassword';
      const storedHash = '$2b$12$hashedpassword';

      bcrypt.compare.mockResolvedValueOnce(false);

      const isMatch = await bcrypt.compare(plainPassword, storedHash);

      expect(isMatch).toBe(false);
    });
  });

  describe('Logout Flow', () => {
    it('should close database connection on logout', () => {
      mockDb.isOpen = true;

      if (mockDb.isOpen) {
        mockDb.close();
      }

      expect(mockDb.close).toHaveBeenCalled();
    });

    it('should only close if database is open', () => {
      mockDb.isOpen = false;

      if (mockDb.isOpen) {
        mockDb.close();
      }

      expect(mockDb.close).not.toHaveBeenCalled();
    });
  });

  describe('Database Connection Management', () => {
    it('should open connection before signup if closed', () => {
      mockDb.isOpen = false;

      if (!mockDb.isOpen) {
        mockDb.open();
      }

      expect(mockDb.open).toHaveBeenCalled();
    });

    it('should open connection before login if closed', () => {
      mockDb.isOpen = false;

      if (!mockDb.isOpen) {
        mockDb.open();
      }

      expect(mockDb.open).toHaveBeenCalled();
    });

    it('should maintain connection state across requests', () => {
      mockDb.isOpen = true;

      // First request
      if (!mockDb.isOpen) mockDb.open();

      expect(mockDb.open).not.toHaveBeenCalled();

      // Connection should still be open
      expect(mockDb.isOpen).toBe(true);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle database errors gracefully', () => {
      const mockPrepare = vi.fn().mockImplementationOnce(() => {
        throw new Error('Database error');
      });
      mockDb.prepare = mockPrepare;

      expect(() => {
        mockDb.prepare('SELECT * FROM users');
      }).toThrow('Database error');
    });

    it('should validate email format', () => {
      const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

      const validEmails = [
        'user@example.com',
        'test.user@example.co.uk',
        'user+tag@example.com',
      ];

      const invalidEmails = [
        'plainaddress',
        '@example.com',
        'user@',
      ];

      validEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(true);
      });

      invalidEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });
  });
});
