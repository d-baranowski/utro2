#!/bin/bash

echo "Stopping PostgreSQL database container..."
docker stop utro-postgres
docker rm utro-postgres
echo "PostgreSQL container stopped and removed."