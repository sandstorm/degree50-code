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
    - pw: !ChangeMe!
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

**Running Behat**

make test


**Graphql**

make build-types


## Testing the SAML Authentication locally
 
In order to test the SAML authentication locally, you need the following `/etc/hosts` entry:

```
127.0.0.1 degree40.tu-dortmund.de
```

- now, browse to [https://degree40.tu-dortmund.de](https://degree40.tu-dortmund.de) and accept the certificate warning.
- then, press the `SAML Login` link, and log in at TU dortmund (credentials in vault)

After testing, **remember to remove the `/etc/hosts` entry again** - as you still want to access the staging system.

The development container contains a self-signed SSL certificate and nginx is serving via SSL on port 8443 - so everything
is prepared for testing the SAML authentication locally.

## Connecting via SSH to the production server

**Prerequisites**

You need an account on gitlab-worker.sandstorm.de - try connecting via `ssh -p 29418 gitlab-worker.sandstorm.de` (TOUCH YUBIKEY!)

**Setup**

You need the following entries in `~/.ssh/config`:

(replace YOUR-USERNAME-ON-GITLAB-WORKER with the right username)

```
Host gitlab-worker.sandstorm.de
  Port 29418
  User YOUR-USERNAME-ON-GITLAB-WORKER
  ForwardAgent yes

Host degree40.tu-dortmund.de
  ProxyJump gitlab-worker.sandstorm.de
  LocalForward 23306 127.0.0.1:3306
```

**Connect**

- Run `ssh [your-username]@degree40.tu-dortmund.de`
- Touch your Yubikey TWICE
- Now, you can become the **deployment** user (which runs `docker-compose`):
  `sudo su - deployment`
- To enter the container, use the following commmand:
  `docker-compose exec api /bin/bash`

**Connect to the Production Database**

- Run the SSH command as above(`ssh [your-username]@degree40.tu-dortmund.de`), keep the connection open
- Connect (e.g. in Sequel Pro or IntelliJ) using the following settings:
  - Host: 127.0.0.1
  - Port: 23306
  - User: api-platform
  - Password: see bitwarden vault
  - DB: api

**Ansible Setup**

The ansible setup is run from the local computer; not from any CI pipeline (so far).

```
cd deployment/prod-server/ansible

# !! ensure login_user is set to your user, and you can run `sudo`
edit inventories/production.yml # and change the login_user to your login user on the server

ansible-playbook -i inventories/production.yml -K server.yml
```

Ansible takes care of:

- adding/configuring users
- hardening the server (SSH config; TODO firewall)
- installing `docker`

**Deployment via Gitlab CI**

- 
