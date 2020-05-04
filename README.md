# Degree 4.0 - ILIAS

Docker container uses the following image for ILIAS:
https://hub.docker.com/r/sturai/ilias/

## Development Setup

**Prerequisites**

- docker & docker-compose
- Make
- composer (and PHP for running composer)


**Get Started with Development**

- Initially, run `make build-docker` to build the docker container
    - if you get ` Allowed memory size of 134217728 bytes exhausted ` during the installation, increase the memory limit of your local php installation ( https://medium.com/@stefanledin/how-to-increase-the-php-7-2-memory-limit-on-mac-os-978ebb78c543 )
    - composer install for ilias runs some post installation php scripts where the memory limit for composer is ignored
- run `docker-compose up -d`
- check installation with `docker-compose logs -f ilias`
- then, prepare ilias installation by running `make setup-ilias`
- After installation is successful, go to `http://127.0.0.1:8080/` and log in with `root / password`


**Exporting Courses**

By executing `docker-compose exec -u www-data ilias Degree40App/bin/console degree40:export 77 exampleCourse`,
the course with RefId `77` is exported to `ilias-customizing/Degree40Exports/exampleCourse`.

**Importing Courses**

By executing `docker-compose exec -u www-data ilias Degree40App/bin/console degree40:import exampleCourse`,
the course `exampleCourse` is imported.