# 🧠 MindShare

A collaborative learning platform for students to find study partners, share materials, create study groups, ask questions, and get AI-powered answers.

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS v4
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Storage**: Backblaze B2 (S3-compatible)
- **AI**: Groq (Llama 3) — free tier
- **Real-time**: Socket.io (live forum answers)
- **Auth**: JWT

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm 9+
- Docker (for local MinIO storage)

### Backend Setup

```bash
cd server
cp .env.example .env
# Edit .env with your PostgreSQL connection string
npm install
npx prisma db push
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

## Project Structure

```
MindShare/
├── client/          # React + Vite frontend
├── server/          # Express + TypeScript backend
│   ├── prisma/      # Database schema & migrations
│   ├── src/
│   │   ├── config/      # Database, upload, AI, socket configs
│   │   ├── controllers/ # Route handlers
│   │   ├── middleware/   # Auth, error handling, file upload
│   │   ├── routes/       # API route definitions
│   │   ├── services/     # Business logic + AI service
│   │   ├── types/        # TypeScript type definitions
│   │   ├── utils/        # Helper functions
│   │   ├── app.ts        # Express app setup
│   │   └── server.ts     # Entry point
│   └── uploads/     # Local file storage (dev only)
└── package.json     # Monorepo workspace root
```

## Deployment

- **Backend**: Railway (auto-deploys from GitHub)
- **Frontend**: Vercel (auto-deploys from GitHub)
- **Storage**: Backblaze B2 (free 10GB)

See the deployment guide for full instructions.

## License

MIT
