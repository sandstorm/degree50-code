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

**Imported endpoints**
- https://localhost:8443
- https://localhost:8443/login
    - login with: admin@sandstorm.de / password
- https://localhost:8443/admin/
- https://localhost:8443/api/graphql
- https://localhost:8443/api/graphql/graphql_playground
- https://localhost:8443/subtitle-editor
