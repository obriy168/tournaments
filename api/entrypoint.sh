#!/bin/sh
set -e
echo "Running migrations..."
alembic upgrade head
echo "Seeding database..."
python -m seed.seed
exec "$@"