const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL connection setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Vill@4171#',
  database: 'expense_tracker_db'
});

// Connect to the database
db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err.stack);
    return;
  }
  console.log('Connected to MySQL');
});

// Create expenses table if it does not exist
db.query(`
  CREATE TABLE IF NOT EXISTS expensesDB (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL
  )
`, err => {
  if (err) throw err;
  console.log('ExpensesDB table created');
});

// Get all expenses
app.get('/api/expensesDB', (req, res) => {
  db.query('SELECT * FROM expensesDB', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add a new expense
app.post('/api/expensesDB', (req, res) => {
  const { date, name, amount } = req.body;
  const query = 'INSERT INTO expensesDB (date, name, amount) VALUES (?, ?, ?)';
  db.query(query, [date, name, amount], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: results.insertId, date, name, amount });
  });
});

// Update an expense
app.put('/api/expensesDB/:id', (req, res) => {
  const { date, name, amount } = req.body;
  const query = 'UPDATE expensesDB SET date = ?, name = ?, amount = ? WHERE id = ?';
  db.query(query, [date, name, amount, req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: req.params.id, date, name, amount });
  });
});

// Delete an expense
app.delete('/api/expensesDB/:id', (req, res) => {
  db.query('DELETE FROM expensesDB WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(204).send();
  });
});


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
