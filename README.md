# 📓 Peblo Notes

<div align="center">
  <p><strong>A highly-polished, AI-powered collaborative notes workspace built for the Peblo Full Stack Developer Challenge.</strong></p>
</div>

---

## 🚀 Overview

Peblo Notes is a modern, full-stack notes application that blends seamless organization with powerful artificial intelligence. Built around the robust **MERN stack**, it provides an elegant and responsive UI to capture, categorize, and structure your thoughts. 

What sets Peblo Notes apart is its deep integration with **Google Gemini 2.5 Flash**. Instead of just storing notes, Peblo acts as an intelligent assistant—reading your content to auto-generate concise summaries, extract actionable tasks, and suggest intelligent titles. 

Designed for production environments, the application includes robust features like real-time auto-saving, secure JWT authentication, reliable transactional emails (via Resend), and public sharing links that allow seamless read-only collaboration.

---

## 🛠️ Tech Stack & Integrations

Peblo Notes integrates modern tools to ensure performance, reliability, and excellent user experience:

### **Frontend Architecture**
- **React 18 + Vite:** Lightning-fast rendering and optimized build processes.
- **Tailwind CSS:** Fully responsive, utility-first styling with a custom, polished design system.
- **React Quill:** A powerful rich text editor offering extensive formatting (bold, italics, lists, blockquotes, code blocks).
- **Vercel Dynamic Import Fallbacks:** Built-in error boundary and auto-reload logic to handle chunk load failures typical of Vercel SPA deployments.
- **Bootstrap Icons:** Clean, modern iconography throughout the application.

### **Backend & Database**
- **Node.js & Express.js:** Scalable RESTful API architecture.
- **MongoDB Atlas & Mongoose:** Cloud-hosted NoSQL database with strict schema validation.
- **JWT & bcryptjs:** Secure password hashing and stateless, token-based authentication (7-day session expiry).

### **AI Integration**
- **Google Gemini 2.5 Flash API:** Leveraged for ultra-fast, context-aware natural language processing.
  - Generates 2-3 sentence summaries of long notes.
  - Automatically extracts bulleted `action_items`.
  - Suggests contextual titles based on raw content.

### **Transactional Email System**
- **Dual-Mode Delivery:** Engineered to handle production deployment constraints (e.g., Render blocking SMTP port 587).
  - **Primary (Production):** Integrates **Resend HTTP API** to securely dispatch OTPs and password reset emails without SMTP.
  - **Fallback (Local):** Uses **Nodemailer** with Gmail SMTP app passwords for local development testing.

---

## ✨ Core Features

### 📝 Intelligent Editor & Organization
- **Rich Text Formatting:** Headings, lists, bold, italics, links, and code blocks.
- **Debounced Auto-Save:** Automatically persists changes to the database 1 second after typing stops to prevent data loss.
- **Smart Tagging:** Add custom tags with real-time autocomplete suggestions.
- **Categorization:** Sort notes into Work, Personal, Study, or Custom categories.
- **Dashboard Analytics:** Track total notes, weekly edits, top tags, and total AI usage statistics.

### 🤖 AI-Powered Productivity
- **One-Click AI Summary:** Condenses lengthy text into a digestible summary.
- **Action Item Extraction:** Automatically reads your text and outputs a checklist of tasks.
- **Title Generation:** Recommends appropriate titles based on the note's context.

### 🔗 Collaboration & Sharing
- **Secure Note Sharing:** Generate a unique, public URL for any note with one click.
- **Read-Only View:** Recipients can view the fully formatted note without needing an account.
- **Clipboard Integration:** Instantly copy formatted note text to your clipboard.
- **Export to TXT:** Download notes locally for offline keeping.

### 🎨 Premium UX Details
- **Persistent Dark Mode:** Seamless toggle between light and dark themes (persists in LocalStorage).
- **Animated Empty States & Skeletons:** Polished loading UI that prevents layout shift.
- **Keyboard Shortcuts:** `Ctrl+N` (New Note), `Ctrl+S` (Save), `Ctrl+/` (Shortcuts Menu).
- **Word Count & Read Time:** Real-time metrics at the bottom of the editor.

---

## 📂 Project Structure

```text
peblo-notes/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── api/                # Axios interceptors and base configurations
│   │   ├── components/         # Reusable UI (Navbar, NoteEditor, Skeletons)
│   │   ├── context/            # React Context (Auth, Theme)
│   │   └── pages/              # Route Pages (Dashboard, Login, Note View)
│   ├── package.json
│   └── vite.config.js
├── server/                     # Express Backend
│   ├── config/                 # DB connection, dual-mode Mailer (SMTP/Resend)
│   ├── controllers/            # Logic (Auth, Notes, Insights)
│   ├── middleware/             # JWT Validation
│   ├── models/                 # Mongoose Schemas (User, Note)
│   ├── routes/                 # API endpoints
│   ├── index.js                # Server entry point
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas cluster URL
- Google Gemini API Key
- Resend API Key (Optional for production email delivery)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/peblo-notes.git
cd peblo-notes
```

### 2. Set up the Backend

```bash
cd server
npm install
cp .env.example .env
```

Open `server/.env` and configure your keys:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0...
JWT_SECRET=supersecretjwtkeyforlocaldev
GEMINI_API_KEY=AIzaSy...

# Email Configuration (Nodemailer fallback)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="Peblo Notes <your-email@gmail.com>"

# Production Email (Resend HTTP API)
RESEND_API_KEY=re_your_resend_key
```

Run the server:
```bash
npm run dev
```
*(Server will start on `http://localhost:5000`)*

### 3. Set up the Frontend

Open a new terminal session:

```bash
cd client
npm install
npm run dev
```
*(Frontend will start on `http://localhost:5173`)*

---

## 📡 API Endpoints Architecture

### Auth `(/auth)`
- `POST /signup` - Register a new user
- `POST /login` - Authenticate & receive JWT
- `POST /forgot-password` - Dispatch OTP via Resend/SMTP
- `POST /verify-otp` - Validate 6-digit OTP
- `POST /reset-password` - securely update hashed password

### Notes `(/notes)` - *Protected*
- `GET /` - Fetch notes (Supports query params: `?search=`, `&tag=`, `&category=`)
- `POST /` - Instantiate a new note
- `PATCH /:id` - Update content, title, tags, or category
- `PATCH /:id/archive` - Move note to archive
- `PATCH /:id/pin` - Toggle pinned status
- `POST /:id/generate-summary` - Trigger Gemini API processing
- `POST /:id/share` - Generate public access UUID
- `GET /insights` - Aggregate dashboard statistics

### Public `(/notes)`
- `GET /shared/:shareId` - Fetch public note data by UUID (No Auth required)

---

## 👨‍💻 Built By

**MD Zeeshan** 
Built as a submission for the **Peblo Full Stack Developer Challenge**.

*Peblo is building India's AI-powered learning universe for children — animated stories, games, quizzes, news, and a personal AI buddy, all in one place.*
