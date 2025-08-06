#!/bin/bash

echo "Starting PostgreSQL database container..."

docker run -d \
  --name utro-postgres \
  -e POSTGRES_DB=utro \
  -e POSTGRES_USER=utro \
  -e POSTGRES_PASSWORD=utro_password \
  -p 5432:5432 \
  -v utro_postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine

echo "Waiting for PostgreSQL to be ready..."
sleep 5

echo "PostgreSQL is running on localhost:5432"
echo "Database: utro"
echo "Username: utro"
echo "Password: utro_password"