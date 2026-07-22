import express from "express";
import ViteExpress from "vite-express";
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
    if (db.isOpen) db.close(); // Close the database connection on logout
    return res.status(200).res.json({ message: "Logout successful" });
});

// Test route to check if the database is open
app.get("/db/users", (req, res) => {
    res.json({ message: `SQLite users.db is open: ${db.isOpen}` });
});

// Let ViteExpress take over the app routing and asset serving
ViteExpress.listen(app, 3000, () => console.log("Server is listening on port 3000..."));
