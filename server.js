import express from "express";
import ViteExpress from "vite-express";
import path from "path";
import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcrypt';

const app = express();

const db = new DatabaseSync('users.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  ) STRICT;
`);

async function hashPassword(plainPassword) {
    const saltRounds = 12; // 12 rounds for maximum security without excessive computation time
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    return hashedPassword;
}

async function verifyPassword(plainPassword, storedHash) {
    const isMatch = await bcrypt.compare(plainPassword, storedHash);
    return isMatch;
}

app.post("/api/signup", express.json(), async (req, res) => {
    if (!db.isOpen) db.open();

    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }
    const existingUser = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);
    if (existingUser) {
        return res.status(409).json({ message: "User already exists." });
    }
    const hashedPassword = await hashPassword(password);
    db.prepare(`INSERT INTO users (email, password) VALUES (?, ?)`).run(email, hashedPassword);
    return res.status(200).json({ message: "Signup successful" });
});

app.post("/api/login", express.json(), async (req, res) => {
    if (!db.isOpen) db.open();

    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }
    const existingUser = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);
    if (!existingUser) {
        return res.status(401).json({ message: "Invalid credentials." });
    }
    const storedHash = db.prepare(`SELECT password FROM users WHERE email = ?`).get(email)?.password;
    const passwordVerified = await verifyPassword(password, storedHash);
    if (passwordVerified) {
        return res.status(200).json({ message: "Login successful", user: email });
    }
    return res.status(401).json({ message: "Invalid credentials." });
});

app.post("/api/logout", express.json(), (req, res) => {
    if (db.isOpen) db.close();
    return res.status(200).json({ message: "Logout successful" });
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
