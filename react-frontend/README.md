# Warhammer Army List Parser - React Frontend

Vite + React + TypeScript frontend for the Warhammer Army List Parser.

## Development

### Local Development (with Django backend)

1. Start the Django backend:
```bash
# In project root
docker-compose up db redis web
```

2. Start the React dev server:
```bash
cd react-frontend
npm install
npm run dev
```

3. Open http://localhost:3000

The Vite dev server will proxy API requests to Django on port 8000.

### Building for Production

```bash
# From project root
./build-frontend.sh

# Or manually:
cd react-frontend
npm run build
```

This builds the React app to `../staticfiles/react/` which Django serves via WhiteNoise.

## Deployment

For production (e.g., Coolify):

**Automated via Dockerfile:**

The frontend build is integrated into the Docker build process:
- Dockerfile installs Node.js
- Runs `npm ci && npm run build` during image build
- `entrypoint.sh` runs `collectstatic` on container start

Just push to Coolify - no manual build needed!

Django will serve:
- `/` → React app (index.html)
- `/parse` → React app (index.html)
- `/api/*` → Django API endpoints
- `/static/*` → Static files (JS, CSS, images)

## Architecture

**Single Domain Setup:**
- Django serves everything on root domain
- React Router handles frontend routing (`/`, `/parse`)
- Django API handles backend routes (`/api/*`)
- WhiteNoise serves React build files as static assets

**Benefits:**
- ✅ No CORS issues
- ✅ Single deployment
- ✅ Simple Coolify setup
- ✅ Fast static file serving with WhiteNoise

## Project Structure

```
react-frontend/
├── src/
│   ├── components/     # Reusable React components
│   ├── pages/          # Page components (Home, Parse)
│   ├── lib/            # Utilities (storage)
│   ├── types/          # TypeScript types
│   ├── App.tsx         # React Router setup
│   ├── main.tsx        # Entry point
│   └── index.css       # Tailwind CSS
├── index.html          # HTML template
├── vite.config.ts      # Vite configuration
└── package.json        # Dependencies
```

## Key Configuration

**vite.config.ts:**
- Builds to `../staticfiles/react`
- Proxies `/api` to Django in dev mode

**Django settings.py:**
- `REACT_APP_DIR` points to build directory
- WhiteNoise serves static files
- Catch-all URL pattern serves React for frontend routes

## Tech Stack

- **Vite** - Build tool
- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling