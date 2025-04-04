require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Get vote count
app.get("/votes", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM votes WHERE candidate_name = 'Robyn Bacon'");
    if (result.rows.length === 0) {
      await pool.query("INSERT INTO votes (candidate_name, vote_count) VALUES ($1, $2)", ['Robyn Bacon', 0]);
      return res.json({ candidate_name: "Robyn Bacon", vote_count: 0 });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit a vote
app.post("/vote", async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE votes SET vote_count = vote_count + 1 WHERE candidate_name = $1 RETURNING *",
      ['Robyn Bacon']
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
