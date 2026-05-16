# Peblo Notes

A full-stack, AI-powered collaborative notes workspace
built for the Peblo Full Stack Developer Challenge.

---

## Overview

Peblo Notes is a modern, collaborative notes workspace that leverages the Anthropic Claude API to provide intelligent productivity insights, auto-generated summaries, and action items. Built with the MERN stack (MongoDB, Express, React, Node.js), it offers a rich text editor experience for seamless note-taking and organization. The application also supports public sharing, allowing users to share their notes easily without requiring the recipient to log in.

---

## Features

### Core
- User authentication (JWT + bcrypt)
- Create, edit, and archive notes
- Auto-save with debounce (1 second)
- Rich text editor with full toolbar (React Quill)

### Organisation
- Tags with autocomplete suggestions
- Categories (Work, Personal, Study, Other)
- Search with real-time filtering
- Filter by tag or category

### AI Integration (Claude API)
- Generate note summaries
- Extract action items automatically
- Get suggested titles from content
- AI usage tracked in dashboard

### Sharing & Collaboration
- One-click public share link
- Public note page (no login required)
- Clean read-only shared view

### Productivity
- Dashboard with stat cards
- Top tags with usage bars
- Recent notes activity
- Weekly edit tracking

### UX
- Dark mode (persists across sessions)
- Markdown preview toggle
- Word count + read time
- Keyboard shortcuts (Ctrl+N, Ctrl+S, Ctrl+/)
- Export note as .txt
- Note pinning
- Loading skeletons
- Animated empty states

---

## Tech Stack

| Layer      | Technology                    |
|------------|-------------------------------|
| Frontend   | React 18 + Vite               |
| Styling    | Tailwind CSS + Bootstrap Icons |
| Backend    | Node.js + Express             |
| Database   | MongoDB + Mongoose            |
| Auth       | JWT + bcrypt                  |
| AI         | Anthropic Claude API          |
| Editor     | React Quill                   |

---

## Project Structure

```text
peblo-notes/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/            # Axios instance
│   │   ├── components/     # Navbar, NotesList, NoteEditor
│   │   ├── context/        # AuthContext, ThemeContext
│   │   └── pages/          # All page components
│   └── .env.example
├── server/                 # Express backend
│   ├── config/             # MongoDB connection
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Auth middleware
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   └── .env.example
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)
- Anthropic API key

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/peblo-notes.git
cd peblo-notes
```

### 2. Set up the backend

```bash
cd server
npm install
cp .env.example .env
```

Open `server/.env` and fill in:
- `MONGO_URI` — your MongoDB Atlas connection string
- `JWT_SECRET` — any random string (e.g. mysecretkey123)
- `ANTHROPIC_API_KEY` — your Anthropic API key
- `PORT` — 5000 (default)

```bash
npm run dev
```

Server runs at `http://localhost:5000`
You should see: "Server running on port 5000" and "MongoDB Connected"

### 3. Set up the frontend

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

App runs at `http://localhost:5173`

---

## API Endpoints

### Auth
- `POST   /auth/signup` - Register a new user
- `POST   /auth/login` - Login and get JWT token

### Notes (all protected — require Bearer token)
- `GET    /notes` - Get all notes (supports `?search=`, `&tag=`, `&category=`)
- `POST   /notes` - Create a new note
- `PATCH  /notes/:id` - Update note title/content/tags
- `PATCH  /notes/:id/archive` - Archive a note
- `PATCH  /notes/:id/unarchive` - Restore an archived note
- `PATCH  /notes/:id/pin` - Toggle note pin
- `POST   /notes/:id/generate-summary` - Generate AI summary
- `POST   /notes/:id/share` - Generate public share link
- `GET    /notes/insights` - Get dashboard stats

### Public
- `GET    /notes/shared/:shareId` - View a shared note (no auth)

---

## Environment Variables

### server/.env.example
```env
PORT=
MONGO_URI=
JWT_SECRET=
ANTHROPIC_API_KEY=
```

### client/.env.example
```env
VITE_API_URL=http://localhost:5000
```

---

## Sample AI Output

**Input note content:**
> "We need to finish the login page, build the notes editor, connect the AI API, and deploy by Friday."

**AI Response:**
```json
{
  "summary": "The team is focused on completing key development tasks including the login page, notes editor, and AI integration, with a Friday deadline for deployment.",
  "action_items": [
    "Finish the login page",
    "Build the notes editor", 
    "Connect the AI API",
    "Deploy by Friday"
  ],
  "suggested_title": "Sprint Tasks & Deployment Goals"
}
```

---

## Database Schema

### User
```javascript
{
  name: String, // (required)
  email: String, // (required, unique)
  password: String, // (hashed with bcrypt)
  timestamps: true
}
```

### Note
```javascript
{
  userId: ObjectId, // (ref: User)
  title: String, // (default: "Untitled")
  content: String, // (HTML from rich text editor)
  tags: [String],
  category: String,
  isArchived: Boolean, // (default: false)
  isPublic: Boolean, // (default: false)
  isPinned: Boolean, // (default: false)
  shareId: String, // (unique, sparse)
  aiSummary: String,
  aiActionItems: [String],
  aiSuggestedTitle: String,
  aiUsageCount: Number, // (default: 0)
  timestamps: true
}
```

---

## Screenshots

[Add your screenshots here]

---

## Built By

**MD Zeeshan** — built as a submission for the Peblo Full Stack Developer Challenge.

Peblo is building India's AI-powered learning universe for children — animated stories, games, quizzes, news, and a personal AI buddy, all in one place.
