# Warhammer Army List Parser

A web application for parsing and analyzing Warhammer 40K army lists. Built with Django (backend) and Next.js (frontend).

## Features

- **Parse Army Lists**: Submit army list text and get structured data with faction, detachment, and unit information
- **Detailed Information**: View complete datasheet details, faction rules, and detachment abilities
- **Local Storage**: Save and manage parsed lists in your browser
- **Share Lists**: Generate shareable links for your army lists
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Backend
- Django 5.x
- PostgreSQL
- Redis
- Celery (for background tasks)
- Django REST Framework

### Frontend
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- React

## Quick Start with Docker

1. Clone the repository:
```bash
git clone <repository-url>
cd warhammer-list-parser
```

2. Start all services:
```bash
docker-compose up
```

3. Access the application:
- **Frontend**: http://localhost:3000
- **Django Admin**: http://localhost:8000/admin
- **Flower (Celery monitoring)**: http://localhost:5555

## Development Setup

### Backend Development

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run migrations:
```bash
python manage.py migrate
```

4. Create a superuser:
```bash
python manage.py createsuperuser
```

5. Run the development server:
```bash
python manage.py runserver
```

### Frontend Development

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.local.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

5. Open http://localhost:3000

## Docker Services

The docker-compose setup includes:

- **db**: PostgreSQL database
- **redis**: Redis cache and message broker
- **web**: Django application
- **celery**: Celery worker for background tasks
- **celery-beat**: Celery beat scheduler
- **flower**: Celery monitoring tool
- **frontend**: Next.js application

## Environment Variables

### Backend (.env)
```bash
DEBUG=True
DATABASE_URL=postgresql://postgres:postgres@db:5432/warhammer_db
REDIS_URL=redis://redis:6379/0
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Project Structure

```
warhammer-list-parser/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # Next.js pages
│   ├── components/          # Reusable React components
│   ├── lib/                 # Utility functions
│   ├── types/               # TypeScript types
│   └── Dockerfile           # Frontend Dockerfile
├── list_parser/             # Django app for parsing lists
├── datasheet_scraper/       # Django app for scraping datasheets
├── warhammer_list_parser/   # Django project settings
├── docker-compose.yml       # Docker composition
├── Dockerfile               # Backend Dockerfile
├── requirements.txt         # Python dependencies
└── manage.py               # Django management script
```

## API Endpoints

- `POST /api/detect-entities/` - Parse army list text
- `GET /api/datasheet/<id>/` - Get datasheet details
- `GET /api/faction/<id>/` - Get faction details
- `GET /api/detachment/<id>/` - Get detachment details
- `POST /api/share/` - Create shareable list link
- `GET /api/shared/<slug>/` - Get shared list

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

[Your License Here]