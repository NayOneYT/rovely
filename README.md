<div align="center">

<img src="./.github/assets//animated-logo.webp" alt="ROVELY" width="320" /><br />

A space for communication, content, and interaction, designed to make familiar formats work more **simply**, **quickly**, and **naturally**

[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Node Version](https://img.shields.io/badge/node-%3E%3D20.19.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue)](https://www.typescriptlang.org)
[![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883)](https://vuejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791)](https://www.postgresql.org)

</div>

---

## 📖 About

Rovely is an ambitious next-generation social platform designed to surpass existing messengers and social networks in every aspect. Built with modern technologies and innovative features, Rovely aims to create the ultimate social experience for users of all ages.

**Current Status**: 🚧 **In Development** — Authentication system (login, registration, verification, password recovery) is implemented.

---

## ✨ Key Features

### 🧱 Block-Based Content System
Unlike traditional social networks where messages are limited to a single type of content, Rovely uses a flexible block-based system. A single message can contain:
- Text
- Images
- Videos
- Audio files
- Documents
- Voice messages
- Circular videos
- Shared posts/messages/comments/photos
- Any combination of the above

### 🌊 Flows (Communities)
Access communities through a unique tilde-based URL system (e.g., `~flowname`). Flows feature:
- Public and private flow types
- Member management with roles (Owner, Moderator, Member)
- **Pulse System** — A dynamic activity indicator that glows brighter based on community engagement
- Flow-specific posts and content

### 💬 Advanced Messaging
- **Multi-Reply System** — Reply to multiple messages simultaneously
- Smart reply display: shows quoted messages in a compact format with expandable dropdown for 4+ replies
- Private and group chats
- Message reactions, pins, and marking
- Read receipts and message views
- System messages support

### 👥 Social Features
- **Custom Friend Names & Avatars** — Give your friends special names and avatars visible only to you
- Follow system
- Friend requests with status tracking
- Blocking and blacklist
- Profile galleries (multiple photos)
- Profile music integration
- Social verification badges

### 🔐 Authentication & Verification
- Email registration with verification
- Phone number verification via Telegram
- Google OAuth integration
- Password recovery via email and phone
- Two-factor authentication support
- JWT-based session management
- Password change tracking

### 📱 Additional Features
- Telegram bot integration for phone verification
- Real-time notifications
- Content reporting and moderation system
- AWS S3 file storage
- PostgreSQL database with Prisma ORM

---

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express 5
- **Language**: TypeScript 6
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Real-time**: Socket.IO
- **Authentication**: JWT, Google Auth Library
- **File Storage**: AWS S3
- **State Management**: Redis
- **Email**: Resend
- **Bot Framework**: Grammy (Telegram)
- **Validation**: Zod

### Frontend
- **Framework**: Vue 3.5 Composition API
- **Build Tool**: Vite 8
- **Language**: TypeScript 6
- **State Management**: Pinia
- **Styling**: TailwindCSS 4
- **Icons**: Lucide Vue
- **HTTP Client**: Axios
- **Data Fetching**: TanStack Vue Query
- **Form Validation**: VeeValidate with Zod
- **Notifications**: Vue Sonner

---

## 🚀 Getting Started

### Prerequisites
- Git
- Docker

### Ports
- Backend: 3000
- Frontend: 5173
- Postgres: 5432

### Process
#### Basic
1. **Navigate to the directory where the project folder should be located**: 
```
cd *some path*
```

2. **Clone repository**:
```
git clone https://github.com/NayOneYT/rovely
```

3. **Navigate to the project directory**:
```
cd rovely
```

4. **Configure .env**:
```
cd backend
cp .env.example .env
```
*configure with [Backend .env](#backend-env) section*

after configured:
```
cd ../frontend
cp .env.example .env
```
*configure with [Frontend .env](#frontend-env) section*

5. **Return to the project directory**:
```
cd ..
```

#### For further development

1. **Install dependencies**:
```
cd backend
npm i
cd ../frontend
npm i
cd ..
```

#### Launch

1. **Build and run docker compose**:
```
docker compose -f compose.dev.yaml up --build
```

### 💻 Recommended IDE Setup

For the best development experience, we recommend using **[VS Code](https://code.visualstudio.com/)**.

The repository includes pre-configured `.vscode/settings.json` (custom icon mappings, format-on-save, type checking) and `.vscode/extensions.json`. When you open the project in VS Code, install the recommended workspace extensions:

- **[Vue (Official / Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)** — Language support for Vue 3
- **[Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)** — Autocomplete & linting for Tailwind CSS 4
- **[Material Icon Theme](https://marketplace.visualstudio.com/items?itemName=pkief.material-icon-theme)** — Custom icons for services, controllers, stores, and composers

---

## 🔧 Environment Variables

### Backend .env
```
# Node Environment
NODE_ENV=development

# Database
DATABASE_URL=postgresql://rovely_user:password@db:5432/rovely?schema=public (default in dev)

# Server Configuration
PORT=3000

# JWT Secrets (generate strong random strings)
JWT_ACCESS_SECRET=your_jwt_access_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here

# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key_here

# Telegram Bot
BOT_TOKEN=your_telegram_bot_token_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### Frontend .env
```
# Google OAuth (Vite requires VITE_ prefix for client-side variables)
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### Getting API Keys
- **Resend API Key**: Sign up at [resend.com](https://resend.com)
- **Telegram Bot Token**: Create a bot via [@BotFather](https://t.me/botfather) on Telegram
- **Google OAuth**: Create credentials at [Google Cloud Console](https://console.cloud.google.com)

---

## 🗺 Roadmap

### ✅ Completed
- [x] User login
- [x] User registration
- [x] Email verification system
- [x] Phone verification via Telegram
- [x] Terms of Use & Privacy Policy
- [x] Google OAuth integration
- [x] Password recovery

### 🚧 In Progress
- [ ] Implement Redis cache
- [ ] Implement Socket.IO

### 📋 Planned
- [ ] Profile management
- [ ] File upload via AWS S3
- [ ] Profile photos gallery
- [ ] Profile music integration
- [ ] Real-time features via Socket.IO
- [ ] Block-based content system implementation
- [ ] Messaging system (private & group chats)
- [ ] Multi-reply system
- [ ] Flows (communities) with tilde URLs
- [ ] Pulse system for flows
- [ ] Social features (follow, friends, blocking)
- [ ] Custom friend names & avatars
- [ ] Posts with multimedia content
- [ ] Comments and reactions
- [ ] Notifications system
- [ ] Content reporting & moderation
- [ ] Performance optimization
- [ ] Comprehensive testing

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the PolyForm Noncommercial License 1.0.0 - see the [LICENSE](LICENSE.md) file for details.

---

## 🌐 Live Demo

[rovely.org](https://rovely.org) — Coming soon!

---

<div align="center">

**Built with ❤️ by [NayOne](https://github.com/NayOneYT)**

</div>