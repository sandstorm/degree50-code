#!/bin/sh
set -ex

mkdir -p var/cache var/log
setfacl -R -m u:www-data:rwX -m u:"$(whoami)":rwX var
setfacl -dR -m u:www-data:rwX -m u:"$(whoami)":rwX var

if [ "$APP_ENV" != 'prod' ]; then
	composer install --prefer-dist --no-progress --no-suggest --no-interaction
fi

echo "Waiting for db to be ready..."
until bin/console doctrine:query:sql "SELECT 1" > /dev/null 2>&1; do
	sleep 1
done

if ls -A src/Migrations/*.php > /dev/null 2>&1; then
	bin/console doctrine:migrations:migrate --no-interaction || echo "ERROR WITH MIGRATION"
fi

/usr/bin/supervisord

