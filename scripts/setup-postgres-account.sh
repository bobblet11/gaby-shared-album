#!/bin/bash
set -euo pipefail
echo "Setting up Postgres user and database..."

echo "----------------------------------------------"
echo "Creating role if not exists..."
# Create role if not exists
sudo -u postgres psql -v ON_ERROR_STOP=1 <<-PSQL
DO \$do\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
      CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';
   END IF;
END
\$do\$;
PSQL

echo "----------------------------------------------"
echo "Creating database if not exists..."
# Create database if not exists
DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'")
if [ -z "$DB_EXISTS" ]; then
  sudo -u postgres createdb -O "${DB_USER}" "${DB_NAME}"
fi

# Grant privileges
sudo -u postgres psql -v ON_ERROR_STOP=1 <<-PSQL
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
PSQL

echo "Postgres setup complete."
