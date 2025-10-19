#!/bin/bash

# Post-deployment script to trigger scrape job if [seed] is in commit message

COMMIT_MESSAGE=$(git log -1 --pretty=%B)

if [[ $COMMIT_MESSAGE == *"[seed]"* ]]; then
    echo "🌱 [seed] found in commit message. Triggering full scrape job..."

    # Queue the full scrape task via Django management command
    docker-compose exec -T web python manage.py run_full_scrape

    echo "✅ Scrape job queued successfully"
else
    echo "ℹ️  No [seed] tag found in commit message. Skipping scrape job."
fi