#!/bin/bash
set -e

echo "Building React frontend..."
cd react-frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Build the React app
echo "Running build..."
npm run build

echo "✓ Frontend built successfully to build/"
echo "Run 'python manage.py collectstatic --noinput' to collect all static files"