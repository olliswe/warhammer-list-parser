# Warhammer Army List Parser

A web application for parsing and analyzing Warhammer 40K army lists. Built with Django (backend) and React + Vite (frontend).

## Features

- Parse and analyze Warhammer 40K army lists
- Modern React frontend with TypeScript and Tailwind CSS
- Django REST API backend
- Background task processing with Celery
- Redis for caching and task queue
- PostgreSQL database

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for frontend development)

## Getting Started

### Docker Setup

The easiest way to run the application is using Docker Compose:

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd warhammer-list-parser
   ```

2. Build and start the containers:
   ```bash
   docker-compose up --build
   ```

3. The application will be available at:
    - Web application: http://localhost:8000
    - Flower (Celery monitoring): http://localhost:5555
        - Default credentials: admin/admin

4. To run database migrations:
   ```bash
   docker-compose exec web python manage.py migrate
   ```

5. Create a superuser (optional):
   ```bash
   docker-compose exec web python manage.py createsuperuser
   ```

6. To populate the database with initial data from 39k.pro (takes some time):
   ```bash
   docker-compose exec web python manage.py run_full_scrape
   ```

### Frontend Development

For frontend development, you can run the React dev server locally:

1. Navigate to the frontend directory:
   ```bash
   cd react-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. The frontend will be available at http://localhost:3000


## Project Structure

```
warhammer-list-parser/
├── datasheet_scraper/      # Web scraping utilities
├── list_parser/            # Main Django app for parsing
├── react-frontend/         # React + Vite frontend
├── warhammer_list_parser/  # Django project settings
├── manage.py              # Django management script
├── requirements.txt       # Python dependencies
├── docker-compose.yml     # Docker services configuration
└── Dockerfile            # Docker build configuration
```

## Development

### Frontend Development

The frontend uses:
- React 18 with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- React Router for routing
- Jotai for state management

Available scripts:
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
```

### Backend Development

The backend uses:
- Django 5.2
- Django REST Framework
- Celery for background tasks
- PostgreSQL for database
- Redis for caching and task queue

Common commands:
```bash
python manage.py makemigrations  # Create new migrations
python manage.py migrate         # Apply migrations
python manage.py test           # Run tests
python manage.py shell          # Django shell
python manage.py run_full_scrape # Populate database with data from 39k.pro
```

## Deployment

The application is configured for automatic deployment:

- **Production**: Pushes to the `master` branch are automatically deployed to [listbin.app](https://listbin.app)


## License

[Add your license here]

## Contributing

[Add contribution guidelines here]
