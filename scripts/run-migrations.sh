#!/bin/bash

echo "Running database migrations..."

# Get the script's directory and navigate to api/app
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/../api/app"

# Database connection parameters
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="utro"
DB_USER="utro"
DB_PASSWORD="utro_password"

# Start database if not running
if ! docker ps | grep -q postgres; then
    echo "PostgreSQL container is not running. Starting it..."
    docker compose up postgres -d
fi

# Wait for database to be ready
echo "Waiting for database to be ready..."
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1" >/dev/null 2>&1; then
        echo "Database is ready!"
        break
    else
        echo "Waiting for database... (attempt $((ATTEMPT + 1))/$MAX_ATTEMPTS)"
        sleep 2
        ATTEMPT=$((ATTEMPT + 1))
    fi
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo "Error: Database did not become ready in time"
    exit 1
fi

# Run migrations using Maven
echo "Running Flyway migrations..."
mvn flyway:migrate

if [ $? -eq 0 ]; then
    echo "Migrations completed successfully."
else
    echo "Migration failed!"
    exit 1
fi