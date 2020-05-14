# Degree 4.0

## Development Setup

**Prerequisites**

- docker & docker-compose
- Make


**Get Started with Development**

- Initially, run `make build-docker` to build the docker container
- run `docker-compose up -d`
- check installation with `docker-compose logs -f api`
- When the container is running:
    - import fixtures by running `make import-fixtures` (dummy data)
    - After installation is successful, go to `https://localhost:8443/login` and log in with `admin@sandstorm.de / password`
    - Install JS dependencies using `make yarn`
    - The JS file watcher can be executed using `make watch`
    - The API types can be regenerated using `make build-types`
    - The Symfony Console can be executed via `./symfony-console`

**Connect with database**

- postgres sql
    - db: api
    - user: api-platform
    - db: !ChangeMe!
    - host: localhost:25432




**Symfony commands**
- ./symfony-console cache:clear
- ./symfony-console make:migration
- ./symfony-console doctrine:migrations:migrate
- ./symfony-console messenger:consume async -vv
- ./symfony-console messenger:consume async -vv --limit=1

- Debug commands:
  - for re-encoding a single video: ./symfony-console app:enqueue-video-encoding ac40cc6c-ad1f-4af0-881a-47d65cbae66d

**Imported endpoints**
- https://localhost:8443
- https://localhost:8443/login
    - login with: admin@sandstorm.de / password
- https://localhost:8443/admin/
- https://localhost:8443/api/graphql
- https://localhost:8443/api/graphql/graphql_playground


'/usr/bin/ffmpeg' '-y' '-i' '/app/var/data/persistent/videos/original/2c5952ed-cfe4-4ec1-9058-8b32066ac9cc.mp4' '-c:v' 'libx264' '-c:a' 'aac' '-bf' '1' '-keyint_min' '25' '-g' '250' '-sc_threshold' '40' '-hls_list_size' '0' '-hls_time' '10' '-hls_allow_cache' '1' '-hls_segment_type' 'fmp4' '-hls_fmp4_init_filename' 'hls_360p_init.mp4' '-hls_segment_filename' '/app/var/cache/dev/flysystem/5c747763-5f53-4f5e-82c1-a0176021d91a/hls_360p_%04d.m4s' '-s:v' '640x360' '-b:v' '1435k' '/app/var/cache/dev/flysystem/5c747763-5f53-4f5e-82c1-a0176021d91a/hls_360p.m3u8' '-c:v' 'libx264' '-c:a' 'aac' '-bf' '1' '-keyint_min' '25' '-g' '250' '-sc_threshold' '40' '-hls_list_size' '0' '-hls_time' '10' '-hls_allow_cache' '1' '-hls_segment_type' 'fmp4' '-hls_fmp4_init_filename' 'hls_720p_init.mp4' '-hls_segment_filename' '/app/var/cache/dev/flysystem/5c747763-5f53-4f5e-82c1-a0176021d91a/hls_720p_%04d.m4s' '-s:v' '1280x720' '-b:v' '2153k' '-strict' '-2' '-threads' '12' '/app/var/cache/dev/flysystem/5c747763-5f53-4f5e-82c1-a0176021d91a/hls_720p.m3u8'
