# NOTE: this file is executed from the ROOT DIRECTORY of the project, i.e. "../"
FROM php:7.4-fpm-bullseye

# Install intl, bcmath, pdo, pdo_mysql, mysqli, libvips, zip
RUN apt-get update -y && \
    apt-get install --no-install-recommends -y libzip-dev zip libicu-dev libxslt1-dev nginx-light libvips libvips-dev supervisor procps redis unzip git acl libpq-dev ffmpeg && \
    mkdir -p /var/log/supervisor && \
    rm -rf /var/lib/apt/lists/* && \
    docker-php-ext-install intl bcmath pdo pdo_mysql mysqli xsl zip && \
    pecl install vips && \
    echo "extension=vips.so" > /usr/local/etc/php/conf.d/vips.ini && \
    pecl install redis && docker-php-ext-enable redis && \
    docker-php-ext-install opcache && docker-php-ext-enable opcache && \
    pecl install apcu && docker-php-ext-enable apcu

# install composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1
# install Symfony Flex globally to speed up download of Composer packages (parallelized prefetching)
RUN set -eux; \
	composer global require "symfony/flex" --prefer-dist --no-progress --no-suggest --classmap-authoritative; \
	composer clear-cache
ENV PATH="${PATH}:/root/.composer/vendor/bin"

## Why no update possible
COPY --from=dunglas/mercure:v0.10.2 /mercure /usr/bin/mercure

#TODO: Test if bullseye's version of ffmpeg (4.3) works now (seems like it on my machine at least)
# add ffmpeg static build
# Why:
#	The version that comes with debian "buster" is too old and does not support features we need.
# 	We tried to use the packages from buster/testing but that would lead to too much reconfiguration of the system.
#   (see: https://serverfault.com/questions/22414/how-can-i-run-debian-stable-but-install-some-packages-from-testing)
#   We tried pulling them out of a ffmpeg docker image:
#	(https://hub.docker.com/layers/jrottenberg/ffmpeg/4.4-ubuntu/images/sha256-0fccee33c89ffa14c6b722e1f54185c5b11cdb64958718d79469708b043af1db?context=explore)
#   Via
#     COPY --from=jrottenberg/ffmpeg:4.4-ubuntu /usr/local/bin/ffmpeg /usr/local/bin/ffmpeg
#     COPY --from=jrottenberg/ffmpeg:4.4-ubuntu /usr/local/bin/ffprobe /usr/local/bin/ffprobe
#   But we first ran into "missing libraries" issues (such as libav<xxx>) and copying or getting them with apt-get
#   didn't fix but rose other issues like:
#   "ffmpeg: symbol av_opt_child_class_iterate version LIBAVUTIL_56 not defined in file libavutil.so.56 with link time reference".
#	So we opted for the static build of the current version (4.4) that includes everything we need to run ffmpeg successfully.
#
#	NOTE:
# 		This implies that security updates won't be installed automatically.
#   	Once the working ffmpeg version (>4.4) is included in a (stable) debian release we should use the ffmpeg that the
#		debian version distributes.
#ADD /deployment/ffmpeg/ffmpeg-4.4-amd64-static/ffmpeg /usr/bin/ffmpeg
#ADD /deployment/ffmpeg/ffmpeg-4.4-amd64-static/ffprobe /usr/bin/ffprobe

# application entrypoint
ADD /deployment/docker/entrypoint.sh /
ADD /deployment/config-files/php.override.ini /usr/local/etc/php/conf.d/php.override.ini

RUN rm -Rf /usr/local/etc/php-fpm.*
ADD deployment/config-files/php-fpm.conf /usr/local/etc/php-fpm.conf

ADD /deployment/config-files/nginx.conf /etc/nginx/nginx.conf
RUN mkdir -p /var/lib/nginx /usr/local/var/log/ & \
    chown -R www-data /var/lib/nginx /usr/local/var/log/ /etc/nginx/

WORKDIR /app

# build for production
ARG APP_ENV=prod

# prevent the reinstallation of vendors at every changes in the source code
COPY api/composer.json api/composer.lock api/symfony.lock ./
RUN set -eux; \
	composer install --prefer-dist --no-dev --no-scripts --no-progress --no-suggest; \
	composer clear-cache

# do not use .env files in production
COPY api/.env ./
RUN composer dump-env prod; \
	rm .env

# copy only specifically what we need

# VERSION file which is necessary to display our version tag inside the UI
# See scripts/versioning.sh for further details
COPY api/VERSION VERSION
COPY api/bin bin/
COPY api/config config/
COPY api/events events/
COPY api/public public/
COPY api/src src/
COPY api/templates templates/
COPY api/translations translations/

RUN set -eux; \
	mkdir -p var/cache var/log; \
	composer dump-autoload --classmap-authoritative --no-dev; \
	composer run-script --no-dev post-install-cmd; \
	chmod +x bin/console; sync
VOLUME /app/var

# generate a dummy self-signed SSL certificate; so SAML can be tested locally.
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -subj "/C=DE/ST=Sachsen/L=Dresden/O=Global Security/OU=IT Department/CN=degree40.tu-dortmund.de" \
  -keyout /etc/ssl/private/nginx-selfsigned.key -out /etc/ssl/certs/nginx-selfsigned.crt

COPY --from=fluent/fluent-bit:1.4 /fluent-bit/bin/fluent-bit /usr/bin/fluent-bit
COPY /deployment/config-files/supervisord.conf /etc/supervisor/supervisord.conf
COPY /deployment/config-files/fluentbit.conf /etc/fluentbit.conf


#COPY docker/php/docker-healthcheck.sh /usr/local/bin/docker-healthcheck
#RUN chmod +x /usr/local/bin/docker-healthcheck

#HEALTHCHECK --interval=10s --timeout=3s --retries=3 CMD ["docker-healthcheck"]

COPY deployment/docker/entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
