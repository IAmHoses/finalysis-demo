import express from "express";
import ViteExpress from "vite-express";
import { DatabaseSync } from 'node:sqlite';

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

// Backend API routes
app.get("/api/users", (req, res) => {
  res.json({ message: `SQLite users.db is open: ${db.isOpen}` });
});

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from the embedded Express app!" });
});

// Let ViteExpress take over the app routing and asset serving
ViteExpress.listen(app, 3000, () => console.log("Server is listening on port 3000..."));
