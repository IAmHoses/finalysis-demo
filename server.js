import express from "express";
import ViteExpress from "vite-express";
import path from "path";
import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcrypt';

const app = express();

// Set up SQLite database
const db = new DatabaseSync('users.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  ) STRICT;
`);

async function hashPassword(plainPassword) {
    console.log("Hashing password: ", plainPassword);
    const saltRounds = 12; // 12 rounds for maximum security without excessive computation time
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    console.log("Hashed password: ", hashedPassword);
    return hashedPassword;
}

async function verifyPassword(plainPassword, storedHash) {
    // Compares raw input to hash, extracts salt, returns true/false
    console.log("Verifying password: ", plainPassword, " | stored hash: ", storedHash);
    const isMatch = await bcrypt.compare(plainPassword, storedHash);
    console.log("Password match: ", isMatch);
    return isMatch;
}

// Backend API routes
app.post("/api/signup", express.json(), async (req, res) => {
    if (!db.isOpen) db.open(); // Open the database connection for signup

    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }
    // Check if user already exists
    const existingUser = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);
    if (existingUser) {
        return res.status(409).json({ message: "User already exists." });
    }
    // Username available -> write hashed password to database
    const hashedPassword = await hashPassword(password);
    db.prepare(`INSERT INTO users (email, password) VALUES (?, ?)`).run(email, hashedPassword);
    return res.status(200).json({ message: "Signup successful" });
});

app.post("/api/login", express.json(), async (req, res) => {
    if (!db.isOpen) db.open(); // Open the database connection for login

    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }
    // Check if user already exists
    const existingUser = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);
    if (!existingUser) {
        return res.status(404).json({ message: "User not found." });
    }
    // Get password hash from database for user's email -> verify password
    const storedHash = db.prepare(`SELECT password FROM users WHERE email = ?`).get(email)?.password;
    const passwordVerified = await verifyPassword(password, storedHash);
    if (passwordVerified) { // Password verified -> return success to AuthContext
        return res.status(200).json({ message: "Login successful", user: email });
    }
    // Password mismatch -> return faillure to AuthContext
    return res.status(401).json({ message: "Invalid credentials." });
});

app.post("/api/logout", express.json(), (req, res) => {
    console.log("Logging out user...");
    if (db.isOpen) db.close(); // Close the database connection on logout
    console.log("DB closed!");
    return res.status(200).json({ message: "Logout successful" });
});

// Test route to check if the database is open. This route can be removed later.
app.get("/db/users", (req, res) => {
    res.json({ message: `SQLite users.db is open: ${db.isOpen}` });
});

app.get("/hello", (req, res) => {
    res.json({ message: "Hello from the backend!" });
});

// Use environment port if provided (Render sets PORT)
const port = process.env.PORT || 3000;

if (process.env.NODE_ENV === 'production') {
    // Serve built static assets from Vite's `dist` directory
    const root = path.resolve();
    app.use(express.static(path.join(root, 'dist')));

    // Catch-all to support client-side routing (React Router)
    app.use((req, res) => {
        res.sendFile(path.join(root, 'dist', 'index.html'));
    });

    app.listen(port, () => console.log(`Server is listening on port ${port} (production)`));
} else {
    // Development: let ViteExpress handle dev server and HMR
    ViteExpress.listen(app, port, () => console.log(`Server is listening on port ${port} (dev)`));
}
