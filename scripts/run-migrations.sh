#!/bin/bash

echo "Running database migrations..."

cd /Users/danielbaranowski/Workspace/utro2/api/app

# Check if PostgreSQL is running
if ! docker ps | grep -q utro-postgres; then
    echo "PostgreSQL container is not running. Starting it..."
    ../scripts/start-db.sh
    sleep 5
fi

# Run migrations using Maven
mvn flyway:migrate

echo "Migrations completed."