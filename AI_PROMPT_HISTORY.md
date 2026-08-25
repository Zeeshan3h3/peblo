# Peblo Notes — Complete AI Prompt History

> This document contains **every prompt** used across 6 AI-assisted coding sessions to build **Peblo Notes** from scratch — a full-stack MERN notes workspace with AI summaries, rich text editing, dark mode, and public sharing. Submitted as part of a job application to demonstrate engineering workflow and AI-assisted development methodology.

---

## Session 1: Backend Foundation
**Date:** May 15, 2026 · **Focus:** Server setup, Express, MongoDB

### Prompt 1.1 — Project Initialization
```
I am starting a MERN stack project called peblo-notes.

The folder already exists with two empty subfolders: client/ and server/

Task: Set up the server only (do not touch client yet)

Inside server/ do the following:

1. Run npm init -y to create package.json
2. Install these packages:
   express, mongoose, dotenv, cors, bcryptjs, jsonwebtoken, uuid
3. Install nodemon as a dev dependency
4. Update package.json scripts to:
   "start": "node index.js"
   "dev": "nodemon index.js"
5. Create this exact folder structure inside server/:
   server/
   ├── config/
   │   └── db.js
   ├── models/
   ├── routes/
   ├── middleware/
   ├── controllers/
   ├── index.js
   └── .env.example

6. In server/config/db.js:
   - Import mongoose
   - Export an async function connectDB that connects to
     process.env.MONGO_URI
   - Log "MongoDB Connected" on success
   - Log the error and exit process on failure

7. In server/index.js:
   - Import express, cors, dotenv, connectDB
   - Call dotenv.config()
   - Call connectDB()
   - Create express app
   - Use cors() and express.json() middleware
   - Create a GET /ping route that returns { message: "pong" }
   - Listen on process.env.PORT or 5000
   - Log "Server running on port X"

8. In .env.example:
   PORT=
   MONGO_URI=
   JWT_SECRET=
   ANTHROPIC_API_KEY=
```

### Prompt 1.2 — Authentication System
```
I am building a MERN stack app called peblo-notes.

The server is already set up with Express and MongoDB connected.
Folder structure already exists:
server/
├── config/db.js
├── models/
├── routes/
├── middleware/
├── controllers/
├── index.js
└── .env.example

Task: Build the complete Auth system (User model + signup + login +
protect middleware)

Step 1 — Create server/models/User.js:
- Import mongoose
- Create a schema with these fields:
  name: String, required, trim
  email: String, required, unique, lowercase, trim
  password: String, required
  timestamps: true
- Export the model as "User"

Step 2 — Create server/controllers/authController.js:
- Import User model, bcryptjs, jsonwebtoken, dotenv

- signup function:
  1. Destructure name, email, password from req.body
  2. If any field is missing return 400: { message: "All fields required" }
  3. Check if user already exists by email, if yes return 400:
     { message: "User already exists" }
  4. Hash password with bcrypt (10 salt rounds)
  5. Create new User with name, email, hashed password
  6. Generate JWT token with user id, expires in 7d
  7. Return 201: { token, user: { id, name, email } }

- login function:
  1. Destructure email, password from req.body
  2. If missing return 400: { message: "All fields required" }
  3. Find user by email, if not found return 400:
     { message: "Invalid credentials" }
  4. Compare password with bcrypt
  5. If wrong return 400: { message: "Invalid credentials" }
  6. Generate JWT, return 200: { token, user: { id, name, email } }

Step 3 — Create server/middleware/authMiddleware.js:
- Export a protect function
- Check for Authorization header with Bearer token
- If no token return 401: { message: "Not authorized" }
- Verify token with jwt.verify
- Find user by decoded id (exclude password)
- Attach user to req.user
- Call next()
- On error return 401: { message: "Token failed" }

Step 4 — Create server/routes/authRoutes.js:
- POST /signup → signup controller
- POST /login → login controller

Step 5 — Update server/index.js:
- Import authRoutes
- Use app.use('/auth', authRoutes)
```

---

## Session 2: MongoDB Connection Fix
**Date:** May 15, 2026 · **Focus:** Environment config debugging

### Prompt 2.1 — Connection Error
```
[nodemon] starting `node index.js`
◇ injected env (0) from .env // tip: ◆ encrypted .env [www.dotenvx.com]
Server running on port 5000
Error: The `uri` parameter to `openUri()` must be a string, got "undefined".
Make sure the first parameter to `mongoose.connect()` or
`mongoose.createConnection()` is a string.
[nodemon] app crashed - waiting for file changes before starting...
```

---

## Session 3: Backend Testing, Frontend Setup & Full Feature Build
**Date:** May 15–16, 2026 · **Focus:** API testing, React scaffold, features, UI overhaul

### Prompt 3.1 — Backend API Testing
```
I have a MERN stack backend for peblo-notes running at
http://localhost:5000

I want to test every single route and schema thoroughly.

My backend has these routes:
- POST /auth/signup
- POST /auth/login
- GET /notes
- POST /notes
- PATCH /notes/:id
- PATCH /notes/:id/archive
- POST /notes/:id/generate-summary
- POST /notes/:id/share
- GET /notes/insights
- GET /shared/:shareId

Task: Write me a complete Thunder Client test plan with:
- Exact URL for each request
- Exact method (GET/POST/PATCH)
- Exact headers needed
- Exact request body JSON
- What the expected response status code should be
- What the expected response body should look like
- What to check in the response to confirm it worked

Test every single scenario including:
- Happy path (everything works correctly)
- Error cases (missing fields, wrong password, invalid token,
  note not found etc.)
```

### Prompt 3.2 — Frontend Setup (Vite + React)
```
I am building a MERN stack app called peblo-notes.

The backend is fully working at http://localhost:5000

Task: Set up the React frontend completely (Vite + React)

Step 1 — Initialize client/:
1. Inside client/ run: npm create vite@latest . -- --template react
2. Install these packages:
   axios, react-router-dom, react-hot-toast
3. Remove all default boilerplate:
   - Clear App.css (keep the file, just empty it)
   - Clear index.css (keep the file, just empty it)
   - Replace App.jsx with a simple placeholder for now

Step 2 — Create this exact folder structure inside client/src/:
src/
├── api/
│   └── axios.js
├── context/
│   └── AuthContext.jsx
├── pages/
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   ├── NotesPage.jsx
│   ├── SharedNotePage.jsx
│   └── DashboardPage.jsx
├── components/
│   ├── Navbar.jsx
│   ├── NotesList.jsx
│   ├── NoteEditor.jsx
│   └── PrivateRoute.jsx
├── App.jsx
└── main.jsx

Step 3 — Create src/api/axios.js:
- Import axios
- Create an instance with baseURL: "http://localhost:5000"
- Add request interceptor to attach Bearer token from localStorage
  key "peblo_token"
- Export the instance

Step 4 — Create src/context/AuthContext.jsx:
- Create AuthContext with createContext
- AuthProvider component with state: user, token, loading
- On mount: check localStorage for token, if exists call
  GET /auth/me to get user data
- login(email, password): POST /auth/login, save token + user
- signup(name, email, password): POST /auth/signup, save token + user
- logout(): clear localStorage, set user to null
- Export useAuth hook

Step 5 — Create src/components/PrivateRoute.jsx:
- If loading show "Loading..."
- If no user redirect to /login
- Otherwise render children

Step 6 — Create all page files with placeholder content
Step 7 — Set up App.jsx with routing
Step 8 — Set up main.jsx entry point
```

### Prompt 3.3 — Notes Workspace (Two-Panel Layout)
```
I am building a MERN stack app called peblo-notes.

Backend is running at http://localhost:5000
Frontend is React with Vite, react-router-dom, axios,
react-hot-toast all installed.

Auth is working. Axios instance is set up in src/api/axios.js
with token interceptor. AuthContext is working.

Task: Build the complete Notes Page with a two-panel layout.
Left panel = notes list. Right panel = note editor.

═══════════════════════════════════════
Step 1 — Update src/pages/NotesPage.jsx
═══════════════════════════════════════

Layout:
- Full height page (height: 100vh)
- Display flex, flex direction column
- Top: Navbar component
- Bottom: flex row taking remaining height (flex: 1)
  Left panel: 300px wide, fixed, not shrinking
  Right panel: flex 1, takes remaining width

State in NotesPage:
  notes: []
  selectedNote: null
  search: ""
  activeTag: "All"
  loading: true

On mount: fetch GET /notes via axios

Functions:
  handleCreateNote: POST /notes with empty body, add to notes
  handleSelectNote: set selectedNote
  handleUpdateNote: PATCH /notes/:id, update in notes array
  handleArchiveNote: PATCH /notes/:id/archive, remove from notes
  handleSearchChange: debounce 400ms then re-fetch with ?search=
  handleTagChange: re-fetch with ?tag=

═══════════════════════════════════════
Step 2 — Create src/components/NotesList.jsx
═══════════════════════════════════════

Props: notes, selectedNote, search, activeTag,
       onSelectNote, onCreateNote, onSearchChange, onTagChange

Layout:
- Top section: "New Note" button (full width, purple)
- Search input below
- Tag chips row: All, work, personal, planning, urgent
- Scrollable notes list

Each note card shows:
- Title (truncated to 1 line)
- First 80 chars of content (truncated)
- Date (formatted: "May 15, 2026")
- Tags as small chips
- Selected note has blue left border

═══════════════════════════════════════
Step 3 — Create src/components/NoteEditor.jsx
═══════════════════════════════════════

Props: note, onUpdateNote, onArchiveNote

State: title, content, tags, tagInput, saving, aiResult

On note change: sync title/content/tags from prop
Auto-save: 1 second after typing stops, call onUpdateNote

Layout:
- Title input (large, no border, placeholder "Untitled")
- Tag input with add/remove
- Content textarea (full height, no border)
- Bottom bar with:
  - Archive button
  - AI Summary button
  - Share button
  - Word count display

AI Summary: POST /notes/:id/generate-summary
Share: POST /notes/:id/share, copy link to clipboard
```

### Prompt 3.4 — Dashboard, Shared Page & Styling
```
I am building a MERN stack app called peblo-notes.

Backend is running at http://localhost:5000
Frontend is React + Vite, fully set up.

The shared note public backend route is:
GET /notes/shared/:shareId (NOT /shared/:shareId)

Task: Build the final 3 remaining pieces.

═══════════════════════════════════════
PIECE 1 — src/pages/DashboardPage.jsx
═══════════════════════════════════════

On mount: call GET /notes/insights via axios
Show a loading spinner while fetching

Layout:
- Full page with Navbar at top
- Page title "Dashboard" font size 28px
- Subtitle "Your productivity at a glance" in gray

Stats cards (4 in a row):
- Total Notes (blue left border)
- Edited This Week (green left border)
- AI Summaries Generated (purple left border)
- Unique Tags Used (orange left border)

Top Tags section: chips with count badges
Recent Notes: last 5 notes with title, tags, date
"Go to Notes" CTA button

═══════════════════════════════════════
PIECE 2 — src/pages/SharedNotePage.jsx
═══════════════════════════════════════

Public route, no auth required
Fetch via GET /notes/shared/:shareId
Error state for bad/expired links
Read-only view with tags, title, content, AI summary

═══════════════════════════════════════
PIECE 3 — src/index.css
═══════════════════════════════════════

Global reset, body font, button states,
input focus ring, custom scrollbar

═══════════════════════════════════════
PIECE 4 — Update src/App.jsx routing
═══════════════════════════════════════
Wire all 5 routes correctly
```

### Prompt 3.5 — 13 Enhancement Features
```
I am building a MERN stack app called peblo-notes.

Task: Implement all 13 enhancement features below.
Do them one by one in order.

════════════════════════════════════════════════════
FEATURE 1 — Markdown Preview Toggle
FEATURE 2 — Word/Character Count Bar
FEATURE 3 — Pin Notes to Top
FEATURE 4 — Keyboard Shortcuts (Ctrl+N, Ctrl+S, Ctrl+/, ?)
FEATURE 5 — AI Usage Warning (3 uses per day)
FEATURE 6 — Category Filter Sidebar
FEATURE 7 — Copy Note Content to Clipboard
FEATURE 8 — Tag Autocomplete from Existing Tags
FEATURE 9 — Unarchive Notes
FEATURE 10 — Loading Skeleton Cards
FEATURE 11 — Dark Mode Toggle
FEATURE 12 — Sort Notes (newest/oldest/title)
FEATURE 13 — Empty State for No Notes
════════════════════════════════════════════════════
```

### Prompt 3.6 — TLS Connection Fix
```
[nodemon] starting `node index.js`
◇ injected env (4) from .env
Server running on port 5000
Error: Client network socket disconnected before secure TLS
connection was established
[nodemon] app crashed - waiting for file changes before starting...
```

### Prompt 3.7 — Rich Text Editor (React Quill)
```
I am building a MERN stack app called peblo-notes.

I want to replace the plain textarea in NoteEditor.jsx
with a rich text editor that has a proper toolbar like:
- Font family and font size selectors
- Bold, italic, underline, strikethrough
- Text alignment (left, center, right)
- Ordered and unordered lists
- Undo and redo buttons
- Text color
- Code block
- Blockquote
- Clear formatting

Task: Implement React Quill as the rich text editor.

STEP 1 — Install React Quill
STEP 2 — Define toolbar configuration
STEP 3 — Replace textarea with ReactQuill component
STEP 4 — Handle word count from HTML content
STEP 5 — Update backend to strip HTML for AI summaries
STEP 6 — Add Quill-specific CSS styles
STEP 7 — Update SharedNotePage to render HTML content
```

### Prompt 3.8 — White Screen Debug
```
white screen when click on notes, analyse each file and then take actions
```

### Prompt 3.9 — Complete UI Overhaul (Peblo Brand)
```
I am building a MERN stack app called peblo-notes.

I want a complete UI overhaul based on Peblo's brand
identity. Peblo is an ed-tech startup with a vibrant
purple brand. Their colors are violet/purple based.

Tech stack for frontend:
- React + Vite (already set up)
- Install Tailwind CSS v3
- Use Bootstrap 5 button components for all buttons
- NO emoji as buttons anywhere — use text labels
  with SVG icons or Bootstrap icons

STEP 1 — Install Dependencies
  npm install -D tailwindcss postcss autoprefixer
  npx tailwindcss init -p
  npm install bootstrap bootstrap-icons

STEP 2 — Configure tailwind.config.js
  - Custom Peblo color palette (violet/purple scale)
  - Custom fonts: Sora (display), DM Sans (body), JetBrains Mono
  - Custom animations and shadows
  - Dark mode: 'class'

STEP 3 — Rewrite index.css
  - Tailwind directives (@tailwind base/components/utilities)
  - Bootstrap and icon imports
  - Google Fonts import
  - Component utility classes

STEP 4 — Create LandingPage.jsx (NEW)
  - Dark purple hero with gradient mesh
  - Rotating words animation
  - Feature cards grid
  - CTA banner and footer

STEP 5 — Redesign LoginPage.jsx
  - Split layout (dark left panel + form right)
  - Floating feature pills
  - Password visibility toggle

STEP 6 — Redesign SignupPage.jsx
  - Same split layout as login
  - Password strength bars (4-level color coded)

STEP 7 — Redesign Navbar.jsx
  - Frosted glass effect
  - NavLink active states
  - Theme toggle with Bootstrap icons

STEP 8 — Redesign NotesList.jsx
  - Category sidebar with icons
  - Chip-based tags
  - Skeleton loaders
  - Archived section

STEP 9 — Redesign NoteEditor.jsx
  - Auto-resize title input
  - Tag chips with suggestions
  - Stats bar (word count, char count)
  - AI panel with glassmorphism

STEP 10 — Redesign DashboardPage.jsx
  - Stat cards with Bootstrap icons
  - Tag distribution bar chart
  - Recent notes list
  - CTA banner

STEP 11 — Redesign SharedNotePage.jsx
  - Sticky branded header
  - Full typography treatment
  - AI summary section

STEP 12 — Update App.jsx routing
  - Add LandingPage at /
  - Protected /notes and /dashboard
  - Public /shared/:shareId

STEP 13 — Update ThemeContext.jsx
  - Apply dark class to both <html> and <body>
```

### Prompt 3.10 — Logo Integration
```
i have pasted my peblo logo in public folder of client,
with name of peblo_logo

use that logo in navbar and many where there is use of
those into website
```

### Prompt 3.11 — Logo Size Fix
```
increase size of logo or tell from where to increase its size
```

### Prompt 3.12 — Auto-Save Bug Investigation
```
what happening is writing in a tab it is showing that it is
saving but suddenly when i refresh that tab it automatically
not save that file even it just show untitled, enhance the
saving mechanism
```

### Prompt 3.13 — Save System Deep Debug
```
actually mein yeh save hi nhi kr raha hai ek baar pure
system ko analyse kro aur dekho kya problem ho rahi hai
because yeh save hi nhi kr raha hai jo is notes web app
ka main part hai
```

### Prompt 3.14 — Save Confirmation Issue
```
what i am facing right now is when i Ctrl+s it is showing
that it is saving but in reality it is not saving anything actually
```

### Prompt 3.15 — Save Bug Final Fix
```
this is what happening here actually, this whole project has
a bug related to saving
```

### Prompt 3.16 — Content Type Fix
```
change type here you know what i am trying to say
```

### Prompt 3.17 — AI Provider Migration
```
i have changed the AI, from anthropic to gemini, also i have
refresh the API key as well so try to work on AI summary part
of this project
```

### Prompt 3.18 — Archive Feature Question
```
how to unarchive the archived notes?
```

### Prompt 3.19 — AI Summary Debugging
```
AI summary part is not working..., try to get that or just
tell me steps to do, check that API key is valid or not
```

### Prompt 3.20 — AI Error Persistence
```
same error is happening due to AI AI ERROR
```

### Prompt 3.21 — AI Fix Steps Request
```
same thing is happening there still server error,
tell me steps how to fix this
```

### Prompt 3.22 — Manual Fix Preference
```
just tell me steps i will fix by my own okay, because same error
```

### Prompt 3.23 — Test File Cleanup
```
remove whatever you have created for tests like testing
files or something
```

### Prompt 3.24 — Shared Page Logo
```
change logo here as well
```

### Prompt 3.25 — Tag Selection UX
```
add tag option, like existing tags just select one of the
tags and it will tagged so do like that
```

### Prompt 3.26 — Layout Fix
```
fix this....
```

### Prompt 3.27 — Screen Fit
```
fit to screen this is what i wanted to fix
```

### Prompt 3.28 — Codebase Security Audit
```
Search through every file in this project and:

1. Remove ALL console.log() statements except these:
   KEEP: server/config/db.js "MongoDB Connected"
   KEEP: server/index.js "Server running on port X"
   REMOVE: everything else

2. Remove ALL console.error() that expose stack traces
   Replace with clean: console.error("Error:", err.message)

3. Remove any TODO comments, commented-out code blocks,
   and unused import statements

4. Remove any hardcoded test data, fake emails,
   test passwords, or placeholder text

5. Check every controller file — make sure no raw
   error objects are sent to frontend:
   WRONG: res.status(500).json({ error: err })
   RIGHT: res.status(500).json({ message: "Server error" })

Show me every file modified and what was changed.
```

### Prompt 3.29 — Frontend Consistency
```
change frontend as it in login page
```

### Prompt 3.30 — Error Fix
```
fix this error
```

### Prompt 3.31 — Deep Analysis Request
```
same error, fix by fully analysing the file very very detailing
```

### Prompt 3.32 — Editor Visibility
```
text editor is not showing
```

---

## Session 4: Premium UI Overhaul v2
**Date:** May 16, 2026 · **Focus:** Senior-designer-quality polish

### Prompt 4.1 — Premium Design Overhaul
```
I am building a MERN stack app called peblo-notes.
It is a notes app built for Peblo — an Indian ed-tech
startup with a purple brand identity.

Tech: React + Vite + Tailwind CSS + Bootstrap Icons
Fonts: Fraunces (display) + Plus Jakarta Sans (body)
       + JetBrains Mono (mono/code)
Primary color: #7C3AED (Peblo purple)

I am sharing 4 screenshots of the current UI state.
This is a COMPLETE UI OVERHAUL of all existing pages.
Do NOT generate placeholder content.
Do NOT leave cards visually empty.
Every design decision must feel intentional.

The goal: make this look like it was designed by a
senior product designer at a top Indian startup —
not an AI template. Premium, warm, human-crafted.

══════════════════════════════════════════════════
GLOBAL DESIGN TOKENS — Apply to ALL components

Shadows:
  shadow-sm: 0 1px 2px rgba(0,0,0,0.04)
  shadow-card: 0 2px 8px rgba(0,0,0,0.06)
  shadow-elevated: 0 8px 24px rgba(0,0,0,0.08)

Borders:
  border-subtle: 1px solid rgba(0,0,0,0.06)
  border-active: 2px solid #7C3AED

Typography:
  Fraunces: only for hero text, page titles
  Plus Jakarta Sans: body, labels, buttons, nav
  JetBrains Mono: code, word count, timestamps

Animations:
  pageEnter: fadeInUp 0.3s ease-out
  editorFade: fadeIn 0.2s ease-in

Color Rules:
  Primary actions: #7C3AED → #6D28D9 hover
  Destructive: #DC2626 at 10% opacity bg
  Success: #059669 at 10% opacity bg
  AI/Magic: gradient #7C3AED → #2563EB
══════════════════════════════════════════════════
```
*(Full prompt included detailed specs for Navbar, DashboardPage, NotesList, NoteEditor, LoginPage, and SignupPage redesigns)*

---

## Session 5: Dark Mode, Security & Deployment
**Date:** May 16, 2026 · **Focus:** Polish, credentials, deployment

### Prompt 5.1 — Dark Mode Fix
```
fix whole dark mode UI it is not working fine
```

### Prompt 5.2 — Credential Security
```
Mongo DB atlas URI is credentials are visible try to fix
that as well put all credentials and all things into .gitignore
```

### Prompt 5.3 — Gitignore Update
```
add things required in .gitignore
```

### Prompt 5.4 — Git Push Fix
```
git push -u origin main
error: src refspec main does not match any
error: failed to push some refs to 'https://github.com/Zeeshan3h3/peblo.git'
```

### Prompt 5.5 — Deployment Guide
```
how to deploy give a guide to deploy this project
```

---

## Session 6: Prompt Documentation & Final Polish
**Date:** May 16, 2026 · **Focus:** AI prompt aggregation, keyboard shortcuts modal

### Prompt 6.1 — Prompt History Generation
```
make an all AI prompts history that is use to make this
project possible from scratch in .md file
```

### Prompt 6.2 — Continuation
```
Continue
```

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| **Total Sessions** | 6 |
| **Total Prompts** | 50+ |
| **Development Days** | 2 (May 15–16, 2026) |
| **Backend Routes** | 10 API endpoints |
| **Frontend Pages** | 6 (Landing, Login, Signup, Notes, Dashboard, Shared) |
| **Components** | 7 (Navbar, NotesList, NoteEditor, KeyboardShortcuts, NoteSkeleton, PrivateRoute) |
| **Features Built** | 13 enhancement features |
| **UI Overhauls** | 2 (initial + premium) |
| **AI Integrations** | Anthropic → Gemini migration |
| **Rich Text Editor** | react-quill → react-quill-new (React 19 fix) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Tailwind CSS v3, Bootstrap Icons |
| **Rich Text** | react-quill-new (React 19 compatible) |
| **State** | React Context (Auth + Theme) |
| **Backend** | Node.js, Express 5 |
| **Database** | MongoDB Atlas, Mongoose |
| **Auth** | JWT + bcryptjs |
| **AI** | Google Gemini API |
| **Fonts** | Fraunces, Plus Jakarta Sans, JetBrains Mono |

---

*Built with AI-assisted development across 6 sessions. Every prompt reflects real engineering decisions — from architecture to pixel-level UI polish.*
