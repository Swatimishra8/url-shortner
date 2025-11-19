# Neon PostgreSQL Setup Guide

## 🚀 Quick Setup

### 1. Create Neon Account
1. Go to [Neon.tech](https://neon.tech)
2. Sign up for a free account
3. Click "Create Project"

### 2. Get Connection String
1. After creating the project, you'll see the connection details
2. Copy the **Connection String** (it looks like this):
```
postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 3. Configure Environment
1. Copy the backend `.env.example` to `.env`:
```bash
cd backend
copy .env.example .env
```

2. Edit the `.env` file and replace the DATABASE_URL:
```env
# Replace this with your actual Neon connection string
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# Server Configuration
PORT=3000
BASE_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

### 4. Test the Connection
```bash
cd backend
npm run dev
```

You should see:
```
Database initialized successfully
Server running on port 3000
```

## 🔧 Alternative: Local PostgreSQL Setup

If you prefer to run PostgreSQL locally:

### 1. Install PostgreSQL
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- **Mac**: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql`

### 2. Create Database
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE tinylink;

-- Create user (optional)
CREATE USER tinylink_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE tinylink TO tinylink_user;
```

### 3. Update .env file
```env
DATABASE_URL=postgresql://tinylink_user:your_password@localhost:5432/tinylink
PORT=3000
BASE_URL=http://localhost:3000
NODE_ENV=development
```

## 🧪 Verify Everything Works

1. **Start the backend**:
```bash
cd backend
npm run dev
```

2. **Start the frontend**:
```bash
cd frontend
npm run dev
```

3. **Test the API**:
```bash
# Health check
curl http://localhost:3000/healthz

# Create a link
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"url":"https://google.com","code":"test123"}'

# Get all links
curl http://localhost:3000/api/links
```

## 🔍 Troubleshooting

### Connection Issues
- Make sure your Neon database is not paused (free tier pauses after inactivity)
- Check that the connection string is correct
- Verify SSL is enabled (`sslmode=require`)

### Port Issues
- If port 3000 is busy, change PORT in `.env` file
- Make sure no other services are running on the same port

### Database Issues
- The app automatically creates tables on first run
- Check the console for database initialization messages
- Verify the user has CREATE TABLE permissions

## 📊 Database Schema

The app will automatically create this table:

```sql
CREATE TABLE IF NOT EXISTS links (
  id SERIAL PRIMARY KEY,
  code VARCHAR(8) UNIQUE NOT NULL,
  url TEXT NOT NULL,
  total_clicks INTEGER DEFAULT 0,
  last_clicked_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_code ON links(code);
```

## 🚀 Next Steps

Once everything is working:
1. Test creating short links in the web interface
2. Verify redirects work by visiting the short URLs
3. Check that click tracking is working
4. Deploy to production when ready!