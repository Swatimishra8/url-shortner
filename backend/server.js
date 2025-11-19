const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { pool, initializeDatabase } = require('./db/pool');
const linksRouter = require('./routes/links');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// API routes
app.use('/api/links', linksRouter);

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.json({ ok: true, version: '1.0' });
});

// Redirect route - GET /:code
app.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    // Skip if it's an API route or static file
    if (code.includes('.') || code.startsWith('api') || code === 'healthz') {
      return res.status(404).json({ error: 'Not found' });
    }
    
    // Find the link
    const result = await pool.query('SELECT * FROM links WHERE code = $1', [code]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    const link = result.rows[0];
    
    // Increment click count and update last_clicked_at
    await pool.query(
      'UPDATE links SET total_clicks = total_clicks + 1, last_clicked_at = CURRENT_TIMESTAMP WHERE code = $1',
      [code]
    );
    
    // Redirect to original URL with 302 status
    res.redirect(302, link.url);
  } catch (error) {
    console.error('Error handling redirect:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();