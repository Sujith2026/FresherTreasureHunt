# Data Hunter - Frontend (React + Vite) ⚡

A modern, production-ready React frontend for Data Hunter, a QR-based team competition platform. This SPA enables teams to register, scan QR codes, view leaderboards, and manage their progress in real time.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Customization](#customization)

---

## ✨ Features

- 🚀 Fast Vite-powered SPA
- 🔒 JWT-based authentication (with localStorage)
- 👥 Team registration, login, and member management
- 📷 QR code scanning (html5-qrcode)
- 🏆 Real-time leaderboard and team stats
- 🛡️ Protected routes (admin and team)
- 📊 Admin dashboard for event control
- 🌈 Responsive, modern UI (Tailwind CSS)
- 🔔 Toast notifications for feedback

---

## 🛠️ Tech Stack

- **Framework:** React 19 + Vite
- **UI:** Tailwind CSS, Lucide Icons
- **QR Scanning:** html5-qrcode
- **HTTP:** Axios
- **Routing:** React Router v7
- **State:** React Context API
- **Notifications:** react-hot-toast

---

## 📁 Project Structure

```
Frontend/
├── public/                  # Static assets
├── src/
│   ├── components/          # Reusable UI components
│   ├── context/             # Auth context provider
│   ├── config/              # API config (axios)
│   ├── lib/                 # Utility functions
│   ├── pages/               # Route pages (Home, Login, Scan, etc.)
│   ├── services/            # API service modules
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Tailwind/global styles
├── .env.example             # Environment template
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## 🚀 Installation

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Step 1: Clone and Install

```bash
cd Frontend
npm install
```

### Step 2: Configure Environment

Copy `.env.example` to `.env` and set your backend API URL:

```env
VITE_API_URL=http://localhost:5000
```

### Step 3: Start Development Server

```bash
npm run dev
```

App will be available at `http://localhost:5173` (default Vite port).

---

## 🔐 Environment Variables

| Variable     | Description                              | Default               |
| ------------ | ---------------------------------------- | --------------------- |
| VITE_API_URL | Backend API base URL (no trailing slash) | http://localhost:5000 |

---

## 📜 Available Scripts

| Script            | Description                      |
| ----------------- | -------------------------------- |
| `npm run dev`     | Start dev server (hot reload)    |
| `npm run build`   | Build for production (`dist/`)   |
| `npm run preview` | Preview production build locally |
| `npm run lint`    | Lint code with ESLint            |

---

## 🏗️ Deployment

1. Build the app:
   ```bash
   npm run build
   ```
2. Deploy the contents of `dist/` to your static hosting (Netlify, Vercel, S3, Nginx, etc.).
3. Ensure your backend CORS allows your frontend domain.
4. Set `VITE_API_URL` in `.env.production` for production API endpoint.

---

## 🛠️ Customization

- **Styling:** Edit `tailwind.config.js` and `index.css` for custom themes.
- **API:** Update `src/config/api.js` for custom axios config or interceptors.
- **Components:** Add or modify components in `src/components/`.
- **Pages:** Add new pages in `src/pages/` and update routing in `App.jsx`.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

---

## 📄 License

ISC License

---

**Happy Hunting! 🏆**
