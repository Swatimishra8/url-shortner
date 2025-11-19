# TinyLink - URL Shortener

A modern URL shortener application built with React, Node.js, Express, and PostgreSQL. Similar to bit.ly, TinyLink allows you to create short, memorable links from long URLs and track their usage analytics.

## Features

- ✨ **Create Short Links**: Generate short codes automatically or use custom codes
- 📊 **Analytics Dashboard**: Track clicks, creation dates, and last accessed times
- 🔗 **Link Management**: View, copy, and delete your links
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🎯 **Click Tracking**: Monitor link usage with detailed statistics
- 🔍 **Search & Filter**: Find your links quickly with built-in search and sorting

## Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database
- **pg** - PostgreSQL client for Node.js

## Project Structure

```
TinyURL/
├── backend/
│   ├── db/
│   │   └── pool.js          # Database connection pool
│   ├── routes/
│   │   └── links.js         # Links API routes
│   ├── server.js            # Express server setup
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js    # API client configuration
│   │   ├── components/
│   │   │   ├── CopyButton.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   └── StatsPage.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## API Endpoints

### Links Management
- `POST /api/links` - Create a new short link
- `GET /api/links` - Get all links
- `GET /api/links/:code` - Get stats for a specific link
- `DELETE /api/links/:code` - Delete a link

### Redirects & Health
- `GET /:code` - Redirect to original URL (with click tracking)
- `GET /healthz` - Health check endpoint

## Database Schema

The application uses a PostgreSQL database with the following schema:

```sql
CREATE TABLE links (
  id SERIAL PRIMARY KEY,
  code VARCHAR(8) UNIQUE NOT NULL,
  url TEXT NOT NULL,
  total_clicks INTEGER DEFAULT 0,
  last_clicked_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- Neon PostgreSQL account (free tier available)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd TinyURL
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Copy environment configuration
copy .env.example .env

# Edit .env with your Neon PostgreSQL connection string
# DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
# PORT=3000
```

### 3. Database Setup
Create a Neon PostgreSQL database and update your `.env` file with the connection string. The application will automatically create the required tables on first run.

1. Sign up at [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string to your `.env` file

### 4. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install
```

### 5. Run the Application

**Development Mode:**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

**Production Mode:**
```bash
# Build frontend
cd frontend
npm run build

# Start backend (serves built frontend)
cd ../backend
npm start
```

The application will be available at `http://localhost:3000`

## Environment Variables

### Backend (.env)
```env
# Neon PostgreSQL Database Configuration
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# Server Configuration
PORT=3000
BASE_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

## Usage

### Creating Short Links
1. Visit the dashboard at `/`
2. Enter a URL in the "Create New Link" form
3. Optionally specify a custom code (6-8 characters, alphanumeric)
4. Click "Create Link"

### Viewing Statistics
1. Click on a short code in the links table
2. Or visit `/code/:code` directly
3. View detailed analytics including:
   - Total clicks
   - Creation date
   - Last clicked time
   - Quick actions to test or copy the link

### Link Management
- **Filter**: Use the search box to filter links by code or URL
- **Sort**: Sort links by creation date, code, or click count
- **Copy**: Use copy buttons to quickly copy short URLs
- **Delete**: Remove links you no longer need

## Code Validation

- Custom codes must be 6-8 characters long
- Only alphanumeric characters (A-Z, a-z, 0-9) are allowed
- Codes are unique - duplicates return a 409 error
- URLs are validated for proper format

## Deployment

### Hosting Options
- **Backend**: Railway, Render, Heroku, DigitalOcean
- **Frontend**: Vercel, Netlify (if serving separately)
- **Database**: Neon, Railway, Amazon RDS, Google Cloud SQL

### Production Considerations
1. Set `NODE_ENV=production` in your environment
2. Use a secure PostgreSQL connection string
3. Configure CORS for your domain
4. Set up proper error logging
5. Use HTTPS in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue in the repository or contact the development team.