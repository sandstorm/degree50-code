# NOTE: this file is executed from the ROOT DIRECTORY of the project, i.e. "../"
FROM php:8.1-fpm-bullseye

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

COPY --from=dunglas/mercure:v0.10.2 /mercure /usr/bin/mercure

# application entrypoint
ADD /deployment/docker/entrypoint.sh /deployment/docker/entrypoint-e2e.sh /
ADD /deployment/config-files/php.override.ini /usr/local/etc/php/conf.d/php.override.ini

RUN rm -Rf /usr/local/etc/php-fpm.*
ADD deployment/config-files/php-fpm.conf /usr/local/etc/php-fpm.conf

ADD /deployment/config-files/nginx.conf /deployment/config-files/nginx-e2e-test-server.conf /etc/nginx/

RUN mkdir -p /var/lib/nginx /usr/local/var/log/ && \
    chown -R www-data /var/lib/nginx /usr/local/var/log/ /etc/nginx/

WORKDIR /app

# build for production
ARG APP_ENV=prod

# prevent the reinstallation of vendors at every changes in the source code
COPY api/composer.json api/composer.lock api/symfony.lock ./

# NOTE: we install dev packages as well for production, because we want to run Behat E2E tests from within the PROD container
# via /entrypoint-e2e.sh
RUN set -eux; \
	composer install --prefer-dist --no-scripts --no-progress --no-suggest; \
	composer clear-cache

# these will be dumped and deleted in entrypoint.sh depending on the APP_ENV
COPY api/.env ./
COPY api/.env.test ./

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
COPY api/tests tests/
COPY api/behat.yml.dist behat.yml.dist
COPY api/features features/
COPY api/composer.json api/composer.lock /app/

RUN set -eux; \
	mkdir -p var/cache var/log; \
	# composer dump-autoload --classmap-authoritative --no-dev; \
	# composer run-script --no-dev post-install-cmd; \
	chmod +x bin/console; sync
VOLUME /app/var

# generate a dummy self-signed SSL certificate; so SAML can be tested locally.
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -subj "/C=DE/ST=Sachsen/L=Dresden/O=Global Security/OU=IT Department/CN=degree40.tu-dortmund.de" \
  -keyout /etc/ssl/private/nginx-selfsigned.key -out /etc/ssl/certs/nginx-selfsigned.crt

COPY --from=fluent/fluent-bit:1.4 /fluent-bit/bin/fluent-bit /usr/bin/fluent-bit
COPY /deployment/config-files/supervisord.conf /etc/supervisor/supervisord.conf
COPY /deployment/config-files/fluentbit.conf /etc/fluentbit.conf


COPY deployment/docker/entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
