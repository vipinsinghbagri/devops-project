const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Get all deployments
app.get("/api/deployments", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM deployments ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching deployments:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/deployments", async (req, res) => {
  try {
    const { version, status } = req.body;

    const result = await pool.query(
      "INSERT INTO deployments (version, status) VALUES ($1, $2) RETURNING *",
      [version, status]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating deployment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      status: "ok",
      database: "connected",
      message: "DevOps Dashboard API is running 🚀",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
    });
  }
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
