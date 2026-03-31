# G3MX — Knowledge Exists in Games

G3MX is a gamified learning platform that transforms traditional educational content into an interactive, mission-based gaming experience. Students progress through worlds, complete chapter quests, earn XP and gems, maintain daily streaks, and compete on leaderboards — making learning genuinely engaging.

---

## Features

### Student Experience
- **World Map** — Choose a learning world (IT World available; Medical, Business, Engineering coming soon)
- **Chapter Missions** — Island-based chapter selector with animated transitions
- **XP & Leveling** — Earn experience points and level up as you complete content
- **Gems** — Secondary currency awarded for achievements
- **Daily Login Streaks** — Tracked with Malaysia timezone (UTC+8); milestone rewards at Day 1, 5, 10
- **Leaderboard Ranking** — Compete with other students
- **Profile Page** — View your level, XP bar, streak, gems, and rank

### Admin Dashboard
- View total active students, quizzes completed, and highest login streak
- Student roster with name, level, and gems
- Role-based access control — students are redirected away

### Authentication
- Email/password registration and login
- Username validation (6–12 characters, unique)
- Role-based routing (student → game hub, admin → dashboard)
- New accounts start at: Level 1, 0 XP, 0 Gems, Unranked

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, JavaScript (ES6+) |
| Styling | Custom CSS + Tailwind CSS 4.2.2 |
| Animation | Canvas API (starfield backgrounds) |
| Backend | Firebase Realtime Database |
| Auth | Firebase Authentication (email/password) |
| Icons | FontAwesome 6.5.0 |
| Fonts | VT323, Press Start 2P, Orbitron, Rajdhani (Google Fonts) |

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (for npm and dev server)
- A Firebase project with Realtime Database and Authentication enabled

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd "Assignment"

# Install dependencies
npm install
```

### Running Locally

**Option 1 — VS Code Live Server (recommended)**
1. Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension
2. Right-click `index.html` → **Open with Live Server**

**Option 2 — Node http-server**
```bash
npx http-server
# Open http://localhost:8080
```

> **Note:** Opening HTML files directly via `file://` may cause Firebase auth issues. Always use a local server.

### Tailwind CSS Build (optional)

```bash
npx tailwindcss -i ./input.css -o ./output.css
```

---

## Project Structure

```
Assignment/
├── index.html          # Landing / marketing page
├── login.html          # Login page (student & admin)
├── signup.html         # Registration page
├── G3MXMain.html       # World / planet selector hub
├── G3MXMain.js         # Planet interaction & animation logic
├── MainMenu.html       # IT World chapter selector
├── MenuStuff.js        # Chapter navigation logic
├── profile.html        # Student profile & progress
├── profile.js          # Profile data management
├── profile.css         # Profile page styles
├── admin.html          # Admin dashboard
├── admin.js            # Admin roster & stats logic
├── admin.css           # Admin page styles
├── auth.js             # Firebase auth, registration, streak logic
├── styles.css          # Landing page & shared styles
├── G3MXMain.css        # Game hub styles
├── MenuStyle.css       # Chapter menu styles
├── script.js           # Landing page scroll animations
├── images/             # Game assets (planets, UI, characters)
├── assets/             # Audio (bg-music.mp3)
├── media/              # Demo videos
└── package.json        # NPM dependencies
```

---

## User Flows

### Student
```
index.html → login.html → G3MXMain.html → MainMenu.html → Chapter[N].html → profile.html
```

### Admin
```
login.html → admin.html
```

---

## Firebase Database Schema

```
users/
  {uid}/
    profileData/
      displayName:    string
      email:          string
      equippedFrame:  string
      role:           "student" | "admin"
      stats/
        level:        number
        xp:           number
        gems:         number
        streak:       number
        rank:         string
    streakData/
      lastLoginDate:  "YYYY-MM-DD"
      currentStreak:  number

usernames/
  {username_lowercase}: uid      # Used for uniqueness checks
```

---

## Visual Style

- **Aesthetic:** Retro 8-bit / pixel art gaming
- **Color Palette:** Cyan (`#00eaff`), dark blue/black, gold (`#dfa632`), orange (`#df6b20`)
- **Effects:** Parallax scrolling, canvas starfield, CSS glow & blur, smooth page transitions

---

## Development Status

| Feature | Status |
|---|---|
| Landing page | Done |
| Authentication (register/login/streaks) | Done |
| World map (planet selector) | Done |
| IT World chapter menu | Done |
| Student profile page | Done |
| Admin dashboard | Done (some stats hardcoded) |
| Medical / Business / Engineering worlds | Coming Soon |
| Chapter content & quiz pages | Done |
| Profile image upload | Done |
| Admin grant XP feature | Planned |

---

## Team & Branches

Each team member works on a dedicated branch:

| Branch | Member |
|---|---|
| `main` | Integration / release |
| `eds` | Ed |
| `ian` | Ian |
| `junyu` | Jun Yu |
| `haur` | Haur |
| `wz` | WZ |
| `yishun` | Yi Shun |

---

## License

This project was developed as a Final Year Project (FYP) at **Asia Pacific University (APU)**. All rights reserved by the project team.
