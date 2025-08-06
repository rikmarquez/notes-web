# Development Notes - Notes Web App

## Project Overview
Personal knowledge management system with React frontend, Node.js/Express backend, and PostgreSQL database.

## Deployment Issues & Solutions

### 2024-01-XX - Initial Setup Complete
**Status:** ✅ Development environment configured successfully
**Solution:** 
- Backend structure with Express, PostgreSQL models, JWT auth
- Frontend with React, React Router, ReactQuill editor
- Full CRUD operations and search functionality implemented

## Libraries & Dependencies

### Backend Dependencies
**What worked well:**
- `express` - Robust web framework, easy routing
- `pg` - PostgreSQL client, good connection pooling
- `bcryptjs` - Reliable password hashing
- `jsonwebtoken` - JWT implementation without issues
- `express-validator` - Clean validation middleware
- `express-rate-limit` - Simple rate limiting setup

**Configuration notes:**
- PostgreSQL connection requires SSL config for Railway: `ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false`
- CORS setup crucial for frontend communication
- Rate limiting set to 100 requests per 15 minutes

### Frontend Dependencies  
**What worked well:**
- `react-quill` - Excellent WYSIWYG editor with good customization
- `axios` - HTTP client with interceptors for auth handling
- `react-router-dom` - v6 routing works smoothly
- Built-in React hooks sufficient for state management

**Configuration notes:**
- ReactQuill requires CSS import: `import 'react-quill/dist/quill.snow.css'`
- Proxy in package.json for development: `"proxy": "http://localhost:3001"`

## Database Setup

### PostgreSQL Schema
**Tables created successfully:**
- `users` - Basic auth with email/password
- `notes` - Full-text search indexes with GIN
- `connections` - Typed relationships between notes

**Important indexes:**
```sql
CREATE INDEX idx_notes_title_gin ON notes USING gin(to_tsvector('spanish', title));
CREATE INDEX idx_notes_content_gin ON notes USING gin(to_tsvector('spanish', content));
```

**Search optimization:**
- Spanish language configuration for full-text search
- Ranking with ts_rank for relevance scoring
- Separate indexes for title, content, summary, and tags

## Architecture Decisions

### Authentication Flow
- JWT tokens stored in localStorage
- Axios interceptors for automatic token attachment
- Redirect to login on 401 responses
- Protected routes with React Router

### State Management
- Custom hooks for auth (`useAuth`) and debouncing (`useDebounce`)
- Component-level state for forms and UI
- No global state library needed for this scope

### Search Implementation
- Real-time search with 300ms debounce
- PostgreSQL full-text search with Spanish configuration
- Results dropdown with highlighting
- Separate search from main notes list

### File Structure
```
backend/src/
├── controllers/    # Business logic separated by domain
├── middleware/     # Reusable auth and validation
├── models/         # Database interaction layer
├── routes/         # Route definitions with validation
└── config/         # Database and app configuration

frontend/src/
├── components/     # Organized by feature (Auth, Notes, etc.)
├── pages/          # Top-level route components
├── hooks/          # Custom React hooks
├── services/       # API communication layer
└── utils/          # Helper functions and utilities
```

## Debugging Tips & Commands

### Development Workflow
```bash
# Backend development
cd backend && npm run dev

# Frontend development  
cd frontend && npm start

# Database connection test
node -e "require('./src/config/database').query('SELECT NOW()', []).then(r => console.log(r.rows))"
```

### Common Issues & Solutions
1. **CORS errors**: Ensure FRONTEND_URL matches in backend .env
2. **Database connection**: Check DATABASE_URL format and SSL settings
3. **JWT errors**: Verify JWT_SECRET is set and consistent
4. **Search not working**: Confirm PostgreSQL Spanish language support

## Configuration Files

### Backend .env Template
```env
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment
- No additional env vars needed for development
- Proxy setting in package.json handles API routing
- Production builds will need REACT_APP_API_URL

## Performance Considerations

### Backend
- Connection pooling with pg
- Debounced search to prevent excessive queries
- Pagination for notes list (20 items per page)
- Indexes on frequently queried fields

### Frontend
- Debounced search input (300ms)
- Lazy loading of note content
- Auto-save functionality (30-second intervals)
- Component-level loading states

## Security Implementation

### Backend Security
- bcryptjs for password hashing (salt rounds: 12)
- JWT tokens with expiration
- Express rate limiting
- Input validation with express-validator
- SQL injection prevention with parameterized queries

### Frontend Security
- JWT tokens in localStorage (consider httpOnly cookies for production)
- Input sanitization for user content
- XSS prevention with ReactQuill's built-in sanitization

## Testing Strategy (Future)
- Backend: Unit tests for models and controllers
- Frontend: React Testing Library for components
- Integration tests for API endpoints
- End-to-end tests with Cypress

## Railway Deployment Notes (Ready)
- Environment variables configured
- PostgreSQL database ready via Railway addon
- Build scripts compatible with Railway
- Static file serving configured in Express

---
*Last updated: Development phase complete - Ready for testing and deployment*