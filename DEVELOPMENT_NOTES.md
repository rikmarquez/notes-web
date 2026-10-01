# Development Notes - Notes Web App

## Project Overview
Personal knowledge management system with React frontend, Node.js/Express backend, and PostgreSQL database.

**Stack:** React + ReactQuill | Express + PostgreSQL | JWT Auth | Railway Deployment

---

## Current Architecture

### Backend Structure
```
backend/src/
├── controllers/    # Business logic (notes, auth, connections, attachments)
├── middleware/     # Auth validation, rate limiting
├── models/         # Database interaction (Note, User, Connection, Attachment)
├── routes/         # API endpoints with validation
└── config/         # Database config + migrations
```

**Key Dependencies:**
- `express`, `pg`, `bcryptjs`, `jsonwebtoken`, `express-validator`, `express-rate-limit`
- PostgreSQL with SSL in production: `ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false`

### Frontend Structure
```
frontend/src/
├── components/     # Auth, Notes, Editor, Connections, Attachments, Search, Layout
├── pages/          # DashboardPage, NoteViewPage, NoteEditPage
├── hooks/          # useAuth, useDebounce
├── services/       # API communication layer
└── utils/          # Helper functions
```

**Key Dependencies:**
- `react-quill` (requires `import 'react-quill/dist/quill.snow.css'`) — uses Quill 1.3.7
- `marked` + `dompurify` (markdown paste conversion + sanitization)
- `axios` with interceptors for JWT
- `react-router-dom` v6

---

## Database Schema

### Tables
- **users:** Basic auth (email, password, name)
- **notes:** UUID primary keys, full-text search indexes, `is_private` flag
- **connections:** Typed relationships between notes
- **attachments:** File metadata with S3-style storage

### Critical Indexes
```sql
-- Full-text search (Spanish language)
CREATE INDEX idx_notes_title_gin ON notes USING gin(to_tsvector('spanish', title));
CREATE INDEX idx_notes_content_gin ON notes USING gin(to_tsvector('spanish', content));

-- Privacy filtering
CREATE INDEX idx_notes_is_private ON notes(is_private);
CREATE INDEX idx_notes_user_private ON notes(user_id, is_private);
```

**Search Implementation:**
- Debounced search (300ms)
- PostgreSQL full-text search with Spanish configuration
- Privacy-aware: `WHERE (is_private = false OR is_private IS NULL OR user_id = $currentUserId)`

---

## Key Features Implementation

### 1. UUID Primary Keys ⚠️ CRITICAL
- **Database uses UUIDs, NOT integers**
- Example: `a2f99ad9-e549-458b-9b61-6078a534d764`
- Validation: Accept string UUIDs, let PostgreSQL handle type conversion
```javascript
// CORRECT: UUID-compatible validation
const noteId = id.toString().trim();
if (!noteId || noteId === '') throw Error('Invalid note ID');
```

### 2. Private Notes System 🔒
- **Default:** All notes public (collaborative by default)
- **Privacy Control:** Per-note `is_private` boolean checkbox
- **Access Rules:** Only owner can view/edit/delete private notes
- **Backend Security:** `Note.canUserAccess(noteId, userId)` validation on every endpoint
- **UI Indicators:** Red 🔒 badge throughout interface

### 3. Mass Import System 📥
- **Endpoint:** `POST /api/notes/import`
- **Format:** JSON with `{notes: [{title, summary, content}]}`
- **Features:** Batch processing, rich text support, error reports
- **Performance:** 1000 notes in ~1-3 minutes

### 4. Universal File Attachments 📂
- **All file types allowed** (no MIME type restrictions)
- **Limit:** 10MB per file
- **Validation:** Filename validation only
- **Icons:** SQL (🗃️), Archives (🗜️), Documents (📄), Images (🖼️), Generic (📎)

### 5. Inline Connection Forms 🔗
- **UX:** Inline form replaces button (no modal scroll issues)
- **Component:** `InlineConnectionForm.js`
- **State Management:** `showInlineForm` toggles button/form visibility
- **Features:** Debounced search, autocomplete, connection types

### 6. Navigation Enhancements 🏠
- **Floating Dashboard Button:** Fixed bottom-right (56x56px circle, green theme)
- **Edit Button Below Content:** Blue button in card footer after note body
- **Purpose:** Eliminate scrolling back to top in long notes

### 7. Dashboard Optimization ⚡
- **Pagination:** 10 notes initial load (was 20)
- **Load More Button:** Professional blue styling with inline CSS
- **Performance:** 50% reduction in initial data transfer

### 8. Markdown Paste ⬇️
- **What:** Pasting markdown into the content editor converts it to rich text (create + edit modes)
- **Module:** `frontend/src/utils/markdownPaste.js` → `attachMarkdownPaste(quill)` returns a cleanup fn
- **Wiring:** `NoteEditor.js` attaches it in a `useEffect` on `loadingNote` via `quillRef.current.getEditor()`
- **Flow:** capture-phase `paste` listener on `quill.root` → `looksLikeMarkdown(text/plain)` → `marked` → `DOMPurify` → `quill.clipboard.convert()` → `collapseBlankLines()` → `updateContents(..., 'user')`
- **Non-markdown pastes** fall through to Quill's default handler untouched
- **Undo:** inserted with source `'user'`, so one Ctrl+Z reverts it
- **Editor formats added:** `blockquote`, `code-block`, `code`, `indent` (nested lists become `ql-indent-N`)
- **View styles:** `.prose` rules in `index.css` (headings, lists, `ql-indent-*`, blockquote, pre, code, links)
- **Limitations:** tables stay as text; task checkboxes become plain bullets

---

## Environment Configuration

### Backend .env
```env
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000,https://your-production-url.com
```

### Frontend
- Development: Uses proxy in package.json (`"proxy": "http://localhost:3001"`)
- Production: Backend serves React static files from `build/`

---

## Deployment (Railway)

### Auto-Deploy Pipeline
1. Push to `main` branch → Railway auto-detects
2. Build: `npm run install:all && CI=false npm run build:frontend`
3. Start: `NODE_ENV=production npm start`
4. Monitor: `railway logs --follow`

### Production Scripts (package.json)
```json
{
  "build": "npm run install:all && npm run build:frontend",
  "start": "NODE_ENV=production cd backend && npm start",
  "install:all": "npm install && cd backend && npm install && cd ../frontend && npm install"
}
```

### Critical Production Settings
- **CORS:** Allow all origins in production for Railway flexibility
- **SSL:** PostgreSQL requires `rejectUnauthorized: false`
- **Static Files:** Express serves React build in production mode
- **Health Check:** `/health` endpoint available

---

## Common Issues & Solutions

### UUID Validation Errors
**Problem:** `parseInt()` returns `NaN` for UUID strings
**Solution:** Validate as string, let PostgreSQL handle conversion
```javascript
// DON'T: const id = parseInt(req.params.id, 10);
// DO: const id = req.params.id.toString().trim();
```

### CORS Errors
**Problem:** Frontend can't reach backend
**Solution:** Verify `FRONTEND_URL` in backend .env matches actual frontend URL

### Search Not Working
**Problem:** PostgreSQL Spanish language support missing
**Solution:** Confirm `to_tsvector('spanish', ...)` indexes exist

### Extra Blank Lines When Inserting HTML into Quill
**Problem:** Quill 1's clipboard adds an empty paragraph wherever pasted blocks have visual margins (e.g. `<p>` followed by `<ul>`), and the result depends on page CSS
**Solution:** Convert HTML with `quill.clipboard.convert()` and collapse consecutive unattributed `\n` in the delta (`collapseBlankLines` in `markdownPaste.js`); code-block newlines carry attributes and are preserved

### Markdown False Positives
**Problem:** Text like "2025. Fue un buen año" matched the ordered-list pattern and lost the year
**Solution:** Ordered-list detection only accepts 1–3 digit numbers (`/^\s*\d{1,3}[.)]\s+\S/m`)

### Formatted Content Looks Flat in Note View
**Problem:** Global reset `* { margin: 0; padding: 0 }` strips heading margins and list indentation; `prose` class had no styles (no Tailwind typography plugin)
**Solution:** Custom `.prose` rules at the end of `frontend/src/index.css`

### Tailwind Classes Not Applying
**Problem:** Framework specificity issues
**Solution:** Use inline CSS for critical UI elements (buttons, navigation)

---

## Development Workflow

### Local Development
```bash
# Backend (terminal 1)
cd backend && npm run dev

# Frontend (terminal 2)
cd frontend && npm start

# Database test
node -e "require('./backend/src/config/database').query('SELECT NOW()').then(r => console.log(r.rows))"
```

### Production Deployment
```bash
# Build frontend
npm run build:frontend

# Test build locally
cd frontend/build && npx serve

# Deploy
git add .
git commit -m "feat: description"
git push origin main  # Railway auto-deploys
```

---

## Critical Technical Patterns

### Privacy-Aware Queries
```javascript
// ALL queries must include privacy filtering
WHERE (n.is_private = false OR n.is_private IS NULL OR n.user_id = $currentUserId)
```

### CSS Strategy
- **Tailwind:** General layout and utilities
- **Inline CSS:** Critical interactive elements (guaranteed application)
- **Use `e.currentTarget`** in hover handlers to avoid nested element issues

### Pagination Pattern
```javascript
// Services default to 10 items
async getNotes(page = 1, limit = 10)
// Frontend "Load More" button fetches next page
```

### File Upload Validation
```javascript
// Universal file acceptance
isValidFileType: (file) => file.name && file.name.trim().length > 0
```

---

## Performance Specifications

### Backend
- Connection pooling with pg
- Rate limiting: 100 requests per 15 minutes
- Pagination: 10 items per page default
- Database indexes on all frequently queried fields

### Frontend
- Debounced search: 300ms delay
- Lazy loading for note content
- Auto-save: 30-second intervals
- Component-level loading states

### Import Performance
- 100 notes: ~10-30 seconds
- 1,000 notes: ~1-3 minutes
- 10,000 notes: ~5-15 minutes

---

## Security Implementation

### Backend
- bcryptjs password hashing (12 salt rounds)
- JWT tokens with 7-day expiration
- Express rate limiting
- Parameterized queries (SQL injection prevention)
- Privacy validation on every CRUD operation

### Frontend
- JWT in localStorage (consider httpOnly cookies for enhanced security)
- ReactQuill sanitization for XSS prevention
- Input validation on all forms

---

## Recent Feature History

| Date | Feature | Key Changes |
|------|---------|-------------|
| 2026-10-01 | Markdown Paste | Auto-convert pasted markdown to rich text, blockquote/code-block in toolbar, `.prose` view styles |
| 2025-01-11 | Edit Button Below Content | Added footer edit button to eliminate scrolling |
| 2025-08-15 | Floating Dashboard Button | Fixed position 🏠 button for quick navigation |
| 2025-01-11 | Dashboard Optimization | Reduced pagination to 10 notes, enhanced load more button |
| 2025-01-11 | Universal File Attachments | Removed MIME restrictions, all file types allowed |
| 2025-01-10 | Private Notes System | User-controlled privacy with backend access validation |
| 2025-01-10 | Inline Connection Form | Replaced modal with inline form for better UX |
| 2025-01-09 | Brand Identity | Custom logo integrated across app |
| 2025-01-07 | Mass Import System | JSON bulk import with rich text support |
| 2025-01-07 | UUID Bug Resolution | Fixed validation for UUID primary keys |
| 2025-01-07 | Railway Deployment | Auto-deploy pipeline with GitHub integration |

---

## Files Modified Reference

### Backend Core Files
- `backend/src/app.js` - CORS, static file serving
- `backend/src/models/Note.js` - UUID validation, privacy methods
- `backend/src/controllers/notesController.js` - Privacy validation, import endpoint
- `backend/src/config/migration-privacy.sql` - Privacy column migration

### Frontend Core Files
- `frontend/src/pages/NoteViewPage.js` - Footer edit button, floating nav button
- `frontend/src/pages/DashboardPage.js` - Import modal integration
- `frontend/src/components/Connections/InlineConnectionForm.js` - New inline form component
- `frontend/src/components/Connections/ConnectionsSection.js` - Inline form state management
- `frontend/src/components/Editor/NoteEditor.js` - Privacy checkbox, markdown paste wiring
- `frontend/src/utils/markdownPaste.js` - Markdown detection, conversion and Quill paste handler
- `frontend/src/index.css` - `.prose` styles for rendered note content
- `frontend/src/services/notesService.js` - Pagination defaults (10 items)
- `frontend/src/services/attachmentsService.js` - Universal file validation

---

*Status: Production system fully operational with comprehensive features*
*Last updated: 2026-10-01*
