const { pool } = require('./db/pool');

async function testRedirect() {
  try {
    // Check if there are any links in the database
    const result = await pool.query('SELECT * FROM links ORDER BY created_at DESC LIMIT 5');
    
    console.log('Links in database:');
    if (result.rows.length === 0) {
      console.log('No links found in database');
    } else {
      result.rows.forEach(link => {
        console.log(`Code: ${link.code} -> ${link.url} (clicks: ${link.total_clicks})`);
      });
    }
    
    // Test creating a link
    const testCode = 'test123';
    const testUrl = 'https://www.google.com';
    
    // First delete if exists
    await pool.query('DELETE FROM links WHERE code = $1', [testCode]);
    
    // Insert test link
    const insertResult = await pool.query(
      'INSERT INTO links (code, url) VALUES ($1, $2) RETURNING *',
      [testCode, testUrl]
    );
    
    console.log('\nCreated test link:', insertResult.rows[0]);
    console.log(`You can test redirect at: http://localhost:3000/${testCode}`);
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    process.exit(0);
  }
}

testRedirect();