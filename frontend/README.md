# Warhammer Army List Parser - Frontend

Next.js frontend for the Warhammer Army List Parser application.

## Features

- **Parse Army Lists**: Submit Warhammer 40K army lists and get detailed breakdowns
- **Local Storage**: Save and manage your parsed lists locally
- **Responsive Design**: Works on desktop and mobile devices
- **Detailed Views**: View faction rules, detachment abilities, and datasheet details
- **Share Lists**: Generate shareable links for your army lists

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Docker

## Development

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file:
```bash
cp .env.local.example .env.local
```

3. Update the API URL in `.env.local` to point to your Django backend:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

### Docker Development

Build and run with Docker Compose (from the project root):
```bash
docker-compose up frontend
```

## Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Home page (saved lists)
│   ├── parse/             # Parse page route
│   └── layout.tsx         # Root layout
├── components/            # Reusable React components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Modal.tsx
│   └── EntryItem.tsx
├── lib/                   # Utility functions
│   └── storage.ts         # LocalStorage helpers
├── types/                 # TypeScript type definitions
│   └── index.ts
└── Dockerfile            # Production Dockerfile
```

## API Integration

The frontend proxies API requests to the Django backend through Next.js rewrites configured in `next.config.ts`. All requests to `/api/*` are forwarded to the backend URL specified in `NEXT_PUBLIC_API_URL`.

## Building for Production

```bash
npm run build
```

The production build uses Next.js standalone output mode, optimized for Docker deployments.
