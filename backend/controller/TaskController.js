const express = require('express');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3003; 
// Initialize SQLite database
const db = new sqlite3.Database('tasks.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    // Create Tasks table if not exists
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      price REAL,
      category TEXT,
      image TEXT,
      sold INTEGER,
      dateOfSale TEXT
    )`);
  }
});

// Fetch data from external API and insert into SQLite database
const fetchAndInsertData = async () => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const data = response.data;
    
    for (const item of data) {
      const queryData = `SELECT id FROM tasks WHERE id = ?`;
      db.get(queryData, [item.id], (err, existingData) => {
        if (err) {
          console.error('Error querying database:', err.message);
          return;
        }
        
        if (!existingData) {
          const query = `INSERT INTO tasks (id, title, description, price, category, image, sold, dateOfSale) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
          db.run(query, [
            item.id,
            item.title,
            item.description,
            item.price,
            item.category,
            item.image,
            item.sold,
            item.dateOfSale
          ], (err) => {
            if (err) {
              console.error('Error inserting data into database:', err.message);
            }
          });
        }
      });
    }
    console.log('Data fetched and inserted into database.');
  } catch (error) {
    console.error('Error fetching data from API:', error.message);
  }
};

// Fetch and insert data on server start
fetchAndInsertData();

// API Endpoints
app.get('/tasks', (req, res) => {
  db.all('SELECT * FROM tasks', (err, rows) => {
    if (err) {
      console.error('Error querying database:', err.message);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.json(rows);
  });
});

// Handle invalid routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});