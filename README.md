# 🎮 ACM SNIoE — Official Website

> The official website of the ACM Student Chapter at Shiv Nadar Institute of Eminence.
> Live at: https://snu.acm.org

## 🏗️ Architecture

| Layer     | Stack                              |
|-----------|-------------------------------------|
| Frontend  | React 19 + Vite, Tailwind CSS, Framer Motion |
| Backend   | Node.js + Express, MySQL (mysql2)   |
| Hosting   | cPanel (static frontend + Node.js API) |

## ✨ Features

- **Retro Pixel-Art Design** — Custom 8-bit/16-bit aesthetic with pixel fonts, animated sprites, and parallax scrolling.
- **Dynamic Team Roster** — Admin-managed team members displayed in a pixel-art card grid with interactive popups.
- **Events System** — Featured events carousel on the homepage + dedicated events page with CRUD admin panel.
- **Arcade Zone** — Two fully playable browser games:
  - 🟡 **Pac-Man** — Classic maze game with power pellets, ghost AI, level progression, speed scaling, and a secret hidden boss level.
  - ⚡ **Reaction Time Challenge** — Test your reflexes across Easy/Medium/Hard difficulties with personal bests and global leaderboard.
- **Global Leaderboard** — MySQL-backed leaderboard showing top scores per unique username, with localStorage personal bests.
- **Admin Dashboard** — Password-protected panel for managing team members and events (accessible at `/admin`).
- **Responsive Design** — Fully optimized for mobile with touch D-Pad controls for arcade games.

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MySQL database

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

### Environment Variables
Create `backend/.env`:
```env
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=acm_website
ADMIN_PASSWORD=your_admin_password
PORT=5000
```

### Production Build
```bash
cd frontend && npm run build
cd dist && tar -czf ../../frontend-build.tar.gz .
```

## 📁 Project Structure

```text
acm-website/
├── frontend/
│   └── src/
│       ├── components/   # Reusable UI components (LoadingScreen, SplitText)
│       ├── pages/        # Route pages (HomePage, EventsPage, GamesHub, 
│       │                 #   PacManGame, ReactionGame, Admin*)
│       ├── utils/        # API helpers and utilities
│       └── main.jsx      # App entry point
├── backend/
│   └── src/
│       ├── config/       # Database configuration
│       ├── middleware/    # Auth middleware
│       ├── routes/       # API routes (team, events, leaderboard)
│       └── server.js     # Express server entry point
└── README.md
```

## 🎨 Design Philosophy

The website is inspired by retro 8-bit/16-bit pixel-art video game aesthetics. Key design pillars:

1. **Custom Pixel Art Assets** — Hand-crafted sprites, backgrounds, and UI elements with `image-rendering: pixelated`.
2. **Authentic Typography** — Pixel fonts (Pixelify Sans, VT323, Silkscreen, Press Start 2P) for the retro feel.
3. **Scroll-Driven Animations** — Parallax effects and reveal animations powered by Framer Motion.
4. **Immersive Audio & Interactivity** — Clickable sprites, arcade games, and hidden easter eggs throughout the site.

## 👤 Author

**Designed & Developed by [dionysus2359](https://www.linkedin.com/in/om-tiwari-240817247)**

Website Architect — ACM SNIoE (2024–2026)

## 📜 License

© 2026 ACM SNIoE Student Chapter. All rights reserved.
