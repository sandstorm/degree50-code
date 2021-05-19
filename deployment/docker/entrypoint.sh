#!/bin/sh
set -ex

mkdir -p var/cache var/log

# Why:
# We create the mount points for local Flysystem adapter that is used by the OneUp\Uploader here to make sure they
# exist with the correct access permissions because somehow the filesystem adapter is creating them initially with
# the wrong permissions.
# Note: That error only happens in the following circumstances:
# 	* When we update the system to have another mount point (here 'var/data/persistent/audio_descriptions')
# 		* When a docker volume already exists
#   		* Then a directory is added on restart of the container with the incorrect permissions
#		* When a docker volume did not exist prior to the update
#			* Then a directory is added correctly on start up of the container
#   	* When we remove the mount directory while the container is running
#			* Then a directory is added correctly the next time an upload is performed
#
# The permissions will be set in the `setfacl` command below.
mkdir -p var/data/persistent/audio_descriptions
mkdir -p var/data/persistent/subtitles

setfacl -R -m u:www-data:rwX -m u:"$(whoami)":rwX var
# TODO: Why?
setfacl -dR -m u:www-data:rwX -m u:"$(whoami)":rwX var

# chown of data directory to "www-data:www-data" so the app can write material to the FS
chown -R www-data:www-data /app/public/data/

if [ "$APP_ENV" != 'prod' ]; then
	composer install --prefer-dist --no-progress --no-suggest --no-interaction
fi

echo "Waiting for db to be ready..."
until bin/console doctrine:query:sql "SELECT 1" > /dev/null 2>&1; do
	sleep 1
done

if ls -A src/Migrations/*.php > /dev/null 2>&1; then
	bin/console doctrine:migrations:migrate --no-interaction || echo "!!!!!!!!! ERROR running Doctrine migrations. Run them after starting and fix the errors."
fi

/usr/bin/supervisord

