# Degree 4.0

## Development Setup

**Prerequisites**

- docker & docker-compose
- Make
- yarn (cp api && nvm use && npm install yarn -g)

**Get Started with Development**

- Initially, run `make build-docker` to build the docker container
- run `docker-compose up -d`
- check installation with `docker-compose logs -f api`
- When the container is running:
    - import fixtures by running `make import-fixtures` (dummy data)
    - After installation is successful, go to `http://localhost:8080/login` and log in with `admin@sandstorm.de / password`
    - Run the assets build (locally) using `cd api && nvm use && yarn`
    - Run the assets watcher (locally) using `cd api && nvm use && yarn encore dev --watch`
    - The API types can be regenerated using `make build-types`
    - The Symfony Console can be executed via `./symfony-console`

**Connect with database**

- mariadb
    - db: api
    - user: api-platform
    - db: !ChangeMe!
    - host: localhost:13306

**Symfony commands**
- ./symfony-console cache:clear
- ./symfony-console make:migration
- ./symfony-console doctrine:migrations:migrate
- ./symfony-console messenger:consume async -vv
- ./symfony-console messenger:consume async -vv --limit=1

- Debug commands:
  - for re-encoding a single video: ./symfony-console app:enqueue-video-encoding ac40cc6c-ad1f-4af0-881a-47d65cbae66d

**Imported endpoints**
- http://localhost:8080
- http://localhost:8080/login
    - login with: admin@sandstorm.de / password
- http://localhost:8080/admin/
- http://localhost:8080/api/graphql
- http://localhost:8080/api/graphql/graphql_playground
- http://localhost:8080/subtitle-editor
