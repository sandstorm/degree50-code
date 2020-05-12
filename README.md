# Degree 4.0 - ILIAS

Docker container uses the following image for ILIAS:
https://hub.docker.com/r/sturai/ilias/

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
    - After installation is successful, go to `http://127.0.0.1:8080/` and log in with `root / password`
    - The JS file watcher can be executed using `make watch`
    - The API types can be regenerated using `make build-types`
    - The Symfony Console can be executed via `./symfony-console`


./symfony-console cache:clear
./symfony-console make:migration
./symfony-console doctrine:migrations:migrate


./symfony-console messenger:consume async -vv
./symfony-console messenger:consume async -vv --limit=1

https://localhost:8443
https://localhost:8443/login
https://localhost:8443/admin/


https://localhost:8443/api/graphql
https://localhost:8443/api/graphql/graphql_playground
