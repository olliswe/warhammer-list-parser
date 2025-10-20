import os
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'warhammer_list_parser.settings')

app = Celery('warhammer_list_parser')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Celery Beat schedule
app.conf.beat_schedule = {
    'run-full-scrape-weekly': {
        'task': 'datasheet_scraper.tasks.full_scrape_task',
        'schedule': crontab(day_of_week=1, hour=0, minute=0),  # Every Monday at midnight
    },
}

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')