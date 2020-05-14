# NOTE: this file is executed from the ROOT DIRECTORY of the project, i.e. "../"
FROM php:7.4.5-fpm-buster

# Install intl, bcmath, pdo, pdo_mysql, mysqli, libvips
RUN apt-get update -y && \
    apt-get install --no-install-recommends -y libicu-dev libxslt1-dev nginx-light libvips42 libvips-dev supervisor procps redis ffmpeg unzip git acl libpq-dev && \
    mkdir -p /var/log/supervisor && \
    rm -rf /var/lib/apt/lists/* && \
    docker-php-ext-install intl bcmath pdo pdo_mysql mysqli xsl && \
    pecl install vips && \
    echo "extension=vips.so" > /usr/local/etc/php/conf.d/vips.ini && \
    pecl install redis && docker-php-ext-enable redis;

# install composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1
# install Symfony Flex globally to speed up download of Composer packages (parallelized prefetching)
RUN set -eux; \
	composer global require "symfony/flex" --prefer-dist --no-progress --no-suggest --classmap-authoritative; \
	composer clear-cache
ENV PATH="${PATH}:/root/.composer/vendor/bin"

COPY --from=dunglas/mercure /mercure /usr/bin/mercure

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
COPY api/bin bin/
COPY api/config config/
COPY api/public public/
COPY api/src src/

RUN set -eux; \
	mkdir -p var/cache var/log; \
	composer dump-autoload --classmap-authoritative --no-dev; \
	composer run-script --no-dev post-install-cmd; \
	chmod +x bin/console; sync
VOLUME /api/var

COPY --from=fluent/fluent-bit:1.4 /fluent-bit/bin/fluent-bit /usr/bin/fluent-bit
COPY /deployment/config-files/supervisord.conf /etc/supervisor/supervisord.conf
COPY /deployment/config-files/fluentbit.conf /etc/fluentbit.conf


#COPY docker/php/docker-healthcheck.sh /usr/local/bin/docker-healthcheck
#RUN chmod +x /usr/local/bin/docker-healthcheck

#HEALTHCHECK --interval=10s --timeout=3s --retries=3 CMD ["docker-healthcheck"]

COPY deployment/docker/entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
