import express from "express";
import ViteExpress from "vite-express";

const app = express();

// Your backend API routes go here
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from the embedded Express app!" });
});

// Let ViteExpress take over the app routing and asset serving
ViteExpress.listen(app, 3000, () => console.log("Server is listening on port 3000..."));
