# NOTE: this file is executed from the ROOT DIRECTORY of the project
FROM php:8.3-fpm-bookworm

RUN apt-get update -y && \
    apt-get install --no-install-recommends -y \
        acl \
        ffmpeg \
        git \
        libicu-dev \
        libpq-dev \
        libvips libvips-dev \
        libxslt1-dev \
        libzip-dev zip unzip \
        nginx-light \
        procps \
        redis \
        && \
    rm -rf /var/lib/apt/lists/* && \
    docker-php-ext-install intl bcmath pdo pdo_mysql mysqli xsl zip && \
    pecl install vips && \
    echo "extension=vips.so" > /usr/local/etc/php/conf.d/vips.ini && \
    pecl install redis && docker-php-ext-enable redis && \
    docker-php-ext-install opcache && docker-php-ext-enable opcache && \
    pecl install apcu && docker-php-ext-enable apcu

WORKDIR /tmp

# add S6 Process Supervisor
ARG S6_OVERLAY_VERSION=3.2.1.0
# https://github.com/just-containers/s6-overlay?tab=readme-ov-file#which-architecture-to-use-depending-on-your-targetarch
ARG S6_OVERLAY_ARCH=x86_64
ADD https://github.com/just-containers/s6-overlay/releases/download/v${S6_OVERLAY_VERSION}/s6-overlay-noarch.tar.xz .
ADD https://github.com/just-containers/s6-overlay/releases/download/v${S6_OVERLAY_VERSION}/s6-overlay-noarch.tar.xz.sha256 .
ADD https://github.com/just-containers/s6-overlay/releases/download/v${S6_OVERLAY_VERSION}/s6-overlay-x86_64.tar.xz .
ADD https://github.com/just-containers/s6-overlay/releases/download/v${S6_OVERLAY_VERSION}/s6-overlay-x86_64.tar.xz.sha256 .
# checksums
RUN sha256sum -c ./*.sha256
# install
RUN tar -C / -Jxpf /tmp/s6-overlay-noarch.tar.xz
RUN tar -C / -Jxpf /tmp/s6-overlay-${S6_OVERLAY_ARCH}.tar.xz

# Latest releases available at https://github.com/aptible/supercronic/releases
ENV SUPERCRONIC_URL=https://github.com/aptible/supercronic/releases/download/v0.2.33/supercronic-linux-amd64 \
    SUPERCRONIC_SHA1SUM=71b0d58cc53f6bd72cf2f293e09e294b79c666d8 \
    SUPERCRONIC=supercronic-linux-amd64

ADD "$SUPERCRONIC_URL" .
RUN echo "${SUPERCRONIC_SHA1SUM}  ${SUPERCRONIC}" | sha1sum -c - \
 && chmod +x "$SUPERCRONIC" \
 && mv "$SUPERCRONIC" "/usr/local/bin/${SUPERCRONIC}" \
 && ln -s "/usr/local/bin/${SUPERCRONIC}" /usr/local/bin/supercronic

WORKDIR /

# install mercure
COPY --from=dunglas/mercure:legacy-v0.11 /mercure /usr/bin/mercure

# add colored shell env to distinguish environments properly
ENV SHELL_ENV_DISPLAY=production
COPY deployment/config-files/bash.colorprompt.sh /etc/bash.colorprompt.sh
RUN echo '. /etc/bash.colorprompt.sh' >>  /etc/bash.bashrc

# copy config files
## s6-overlay
COPY /deployment/config-files/s6-rc.d/ /etc/s6-overlay/s6-rc.d/
## php
RUN rm -Rf /usr/local/etc/php-fpm.*
COPY deployment/config-files/php-fpm.conf /usr/local/etc/php-fpm.conf
COPY deployment/config-files/php.override.ini /usr/local/etc/php/conf.d/php.override.ini
## cron
COPY /deployment/config-files/degree_crontab /etc/cron.d/degree_crontab
## nginx
COPY /deployment/config-files/nginx.conf /etc/nginx/
RUN mkdir -p /var/lib/nginx /usr/local/var/log/ && \
    chown -R www-data /var/lib/nginx /usr/local/var/log/ /etc/nginx/

# copy application files
COPY app/assets /app/assets
COPY app/config /app/config
COPY app/bin /app/bin
COPY app/features /app/features
COPY app/migrations /app/migrations
COPY app/public /app/public
COPY app/src /app/src
COPY app/templates /app/templates
COPY app/tests /app/tests
COPY app/translations /app/translations
COPY app/vendor /app/vendor
COPY app/.env /app/
COPY app/composer.json app/composer.lock app/symfony.lock /app/
COPY app/VERSION /app/
COPY app/behat.yml.dist /app/
COPY app/phpunit.xml.dist /app/

# create /app/var dir to prevent docker compose creating it when mounting volumes in /app/var/
# which would lead to /app/var being owned by root:root.
RUN mkdir /app/var

# set permissions to user www-data
RUN chown -R www-data:www-data /app

WORKDIR /app
# start s6 as www-data
USER www-data
ENTRYPOINT ["/init"]
