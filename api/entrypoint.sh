#!/bin/sh

set -e

echo "Run migrations..."

while ! pg_isready -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER; do
    echo "Waiting for database..."
    sleep 1
done

alembic upgrade head

echo "Populate database with test data..."
python seed/seed.py

exec "$@"