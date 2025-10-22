FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies including Chromium and Node.js
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        build-essential \
        libpq-dev \
        wget \
        gnupg \
        unzip \
        curl \
        ca-certificates \
        chromium \
        chromium-driver \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Build React frontend
RUN cd react-frontend && npm ci && npm run build

# Copy and make entrypoint script executable
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Static files will be collected at runtime via entrypoint.sh

# Create a non-root user with home directory
RUN groupadd -r django && useradd -r -g django -m django
RUN chown -R django:django /app
RUN mkdir -p /home/django/.wdm && chown -R django:django /home/django/.wdm

# Set environment variables for webdriver manager
ENV WDM_LOCAL=1
ENV WDM_LOG_LEVEL=0

USER django

# Expose port
EXPOSE 8000

# Run the application
CMD ["./entrypoint.sh"]