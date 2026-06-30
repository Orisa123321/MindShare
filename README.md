# 📚 StudyShare

A study-sharing platform for students to find study partners, share materials, create study groups, and ask questions.

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS v4
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Storage**: Local disk (MVP) → AWS S3 (production)
- **Auth**: JWT

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm 9+

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
StudyShare/
├── client/          # React + Vite frontend
├── server/          # Express + TypeScript backend
│   ├── prisma/      # Database schema & migrations
│   ├── src/
│   │   ├── config/      # Database, upload, AI configs
│   │   ├── controllers/ # Route handlers
│   │   ├── middleware/   # Auth, error handling, file upload
│   │   ├── routes/       # API route definitions
│   │   ├── services/     # Business logic
│   │   ├── types/        # TypeScript type definitions
│   │   ├── utils/        # Helper functions
│   │   ├── app.ts        # Express app setup
│   │   └── server.ts     # Entry point
│   └── uploads/     # Local file storage (dev)
└── package.json     # Monorepo workspace root
```

## License

MIT
