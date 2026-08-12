#!/bin/sh
set -e

echo "Aguardando MySQL..."
until python -c "
import os, MySQLdb
MySQLdb.connect(
    host=os.environ.get('DB_HOST','db'),
    user=os.environ.get('DB_USER','root'),
    passwd=os.environ.get('DB_PASSWORD',''),
    db=os.environ.get('DB_NAME','orion_django'),
)
" 2>/dev/null; do
  sleep 2
done

echo "MySQL pronto."

python manage.py collectstatic --noinput
python manage.py migrate --noinput

exec "$@"
