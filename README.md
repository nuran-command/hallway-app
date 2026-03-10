# HallWay 

> **The social network for university students.** Connect with peers, join discussions, share moments, and grow together — all in one place.

![HallWay Banner](https://img.shields.io/badge/HallWay-Student%20Network-6366f1?style=for-the-badge&logo=react)
![Node](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Storage-orange?style=flat-square&logo=firebase)
![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-black?style=flat-square&logo=socket.io)

---

##  Features

| Feature | Description |
|---|---|
|  **Authentication** | Email/password sign-in & sign-up via Firebase Auth |
|  **Friend System** | Send, accept, and manage friend requests with real-time notifications |
|  **Discussion Boards** | Create, edit, and delete community boards by category |
|  **Posts** | Create rich posts with text & image uploads (Firebase Storage); edit and delete your own |
|  **Likes & Comments** | Interact with community posts; post owners get real-time notifications |
|  **Direct Messages** | Real-time private chat between friends via Socket.IO |
|  **Notifications** | Bell panel with typed alerts: friend requests, likes, comments, messages |
|  **Profile Page** | Avatar upload, bio editing, activity stats + XP/Level gamification system |
|  **Gamification** | XP points, 5-tier level system (Explorer → HallWay Master), earned badges |
|  **Settings** | Change display name, password, notification preferences, theme, language |
|  **Dark Mode** | Toggle between light and dark themes, persisted across sessions |
|  **Data Persistence** | All data saved to JSON files — survives server restarts |

---

##  Tech Stack

### Frontend
- **React 18** + **React Router v6** — SPA navigation
- **Socket.IO Client** — real-time events (posts, notifications, chat)
- **Firebase SDK** — authentication & file storage
- **react-icons** — icon library
- **react-markdown** — rich post rendering
- **Vanilla CSS** — custom design system with CSS variables

### Backend
- **Node.js** + **Express 5** — REST API server
- **Socket.IO** — WebSocket server for real-time features
- **Firebase Admin SDK** — server-side Firebase operations
- **JSON File Storage** — lightweight persistent database (`backend/data/`)

---

##  Project Structure

```
StudentNetwork/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Boards.jsx / .css       # Community boards listing + create/edit/delete
│   │   │   ├── BoardPage.jsx / .css    # Board discussion page with posts
│   │   │   ├── ChatPage.jsx / .css     # Real-time direct messaging
│   │   │   ├── Dashboard.jsx / .css    # Home dashboard with feed & friends
│   │   │   ├── LoginPage.jsx / .css    # Authentication page
│   │   │   ├── Profile.jsx / .css      # User profile with stats & gamification
│   │   │   ├── Settings.jsx / .css     # Account settings
│   │   │   ├── TopHeader.jsx / .css    # App header with notification bell
│   │   │   ├── Sidebar/
│   │   │   │   ├── Sidebar.jsx         # Navigation sidebar
│   │   │   │   └── Sidebar.css
│   │   │   └── Onboarding.jsx          # First-time user tour
│   │   ├── App.jsx                     # Root component + routing
│   │   ├── firebase.js                 # Firebase config
│   │   ├── themeStore.jsx              # Theme context (dark/light)
│   │   ├── App.css                     # Global layout styles
│   │   └── theme.css                   # CSS variables for theming
│   ├── index.html
│   └── package.json
│
├── backend/
│   ├── server.js                       # Express + Socket.IO server
│   ├── data/                           #  Auto-created, gitignored JSON DB files
│   │   ├── boards.json
│   │   ├── posts.json
│   │   ├── friendships.json
│   │   ├── notifications.json
│   │   ├── users.json
│   │   └── messages.json
│   ├── serviceAccountKey.json          #  Firebase Admin key (gitignored)
│   └── package.json
│
├── package.json                        # Root scripts (npm run dev)
└── README.md
```

---

##  Quick Start

### Prerequisites
- Node.js 18+
- A Firebase project with **Authentication** and **Storage** enabled

### 1. Clone the repository
```bash
git clone https://github.com/yourname/student-network.git
cd student-network
```

### 2. Configure Firebase

**Frontend** — copy your Firebase config into `frontend/src/firebase.js`:
```js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
```

**Backend** — download your Firebase Admin Service Account key as `backend/serviceAccountKey.json`. Update the `storageBucket` in `backend/server.js` to match your project.

### 3. Install dependencies
```bash
npm install          # installs root + both workspaces
```

Or manually:
```bash
cd frontend && npm install
cd ../backend && npm install
```

### 4. Start the development server
```bash
npm run dev          # starts both frontend (port 5173) and backend (port 3000)
```

Open **http://localhost:5173** in your browser.

> The `backend/data/` directory is created automatically on first run.

---

## 🌐 API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/boards` | List all boards |
| POST | `/api/boards` | Create a board |
| PUT | `/api/boards/:id` | Edit a board |
| DELETE | `/api/boards/:id` | Delete a board |
| GET | `/api/posts?boardId=` | Get posts for a board |
| POST | `/api/posts` | Create a post |
| PUT | `/api/posts/:id` | Edit a post |
| DELETE | `/api/posts/:id` | Delete a post |
| POST | `/api/posts/:id/like` | Toggle like (fires notification) |
| POST | `/api/posts/:id/comment` | Add comment (fires notification) |
| POST | `/api/friends/request` | Send friend request |
| POST | `/api/notifications/:id/accept` | Accept friend request |
| POST | `/api/notifications/:id/clear` | Dismiss notification |
| GET | `/api/notifications/:userId` | Get user notifications |
| GET | `/api/friends/:userId` | Get friend list with status |
| POST | `/api/users/profile` | Register/update user profile |
| GET | `/api/user-stats/:userId` | Get activity stats |
| GET | `/api/messages/:u1/:u2` | Fetch conversation history |
| POST | `/api/messages` | Send a chat message |
| GET | `/api/recent-posts` | Get last 5 posts (all boards) |

### Socket.IO Events

| Event | Direction | Description |
|---|---|---|
| `join_hallway` | Client → Server | Register user socket |
| `notification` | Server → Client | Real-time notification |
| `receive_message` | Server → Client | Incoming chat message |
| `new_post` | Server → All | New post broadcast |
| `online_status_change` | Server → All | User went online/offline |
| `user_typing` | Client → Others | Typing indicator |

---

##  Gamification

Students earn XP from their activity:

| Action | XP |
|---|---|
| Create a post | +50 XP |
| Receive a like | +5 XP |

**Level Tiers:**

| Level | XP Required |
|---|---|
|  Explorer | 0 |
|  Contributor | 100 |
|  Scholar | 300 |
|  Legend | 700 |
|  HallWay Master | 1500+ |

---

##  Security Notes

- `backend/serviceAccountKey.json` is **gitignored** — never commit this file
- `backend/data/` is **gitignored** — contains user data, should not be in version control
- Firebase Auth handles all password management; the backend never stores passwords
- Profile data is only visible to the user's friends (privacy wall for non-friends)

---

##  License

MIT © 2026 HallWay Team
