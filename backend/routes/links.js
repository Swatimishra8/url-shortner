const express = require('express');
const router = express.Router();
const { pool } = require('../db/pool');

// Generate random code
function generateCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Validate URL format
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Validate code format (regex: [A-Za-z0-9]{6,8})
function isValidCode(code) {
  const codeRegex = /^[A-Za-z0-9]{6,8}$/;
  return codeRegex.test(code);
}

// POST /api/links - Create a new short link
router.post('/', async (req, res) => {
  try {
    const { url, code } = req.body;

    // Validate URL
    if (!url || !isValidUrl(url)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    let shortCode = code;

    // If custom code provided, validate it
    if (shortCode) {
      if (!isValidCode(shortCode)) {
        return res.status(400).json({ error: 'Code must be 6-8 characters long and contain only letters and numbers' });
      }
      
      // Check if code already exists
      const existingResult = await pool.query('SELECT id FROM links WHERE code = $1', [shortCode]);
      if (existingResult.rows.length > 0) {
        return res.status(409).json({ error: 'Code already exists' });
      }
    } else {
      // Auto-generate code
      let attempts = 0;
      do {
        shortCode = generateCode();
        const existingResult = await pool.query('SELECT id FROM links WHERE code = $1', [shortCode]);
        if (existingResult.rows.length === 0) break;
        attempts++;
      } while (attempts < 10);
      
      if (attempts >= 10) {
        return res.status(500).json({ error: 'Failed to generate unique code' });
      }
    }

    // Insert new link
    const result = await pool.query(
      'INSERT INTO links (code, url) VALUES ($1, $2) RETURNING *',
      [shortCode, url]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/links - Get all links
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM links ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching links:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/links/:code - Get stats for one link or handle redirect
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { redirect } = req.query;
    
    const result = await pool.query('SELECT * FROM links WHERE code = $1', [code]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    // If this is a redirect request, increment click count
    if (redirect === 'true') {
      await pool.query(
        'UPDATE links SET total_clicks = total_clicks + 1, last_clicked_at = CURRENT_TIMESTAMP WHERE code = $1',
        [code]
      );
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/links/:code - Delete link
router.delete('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    const result = await pool.query('DELETE FROM links WHERE code = $1', [code]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    console.error('Error deleting link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;