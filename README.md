# Degree 4.0

<!-- vim-markdown-toc GitLab -->

-   [Making a versioned release](#making-a-versioned-release)
    -   [Special notes on master releases](#special-notes-on-master-releases)
    -   [Where to find the version number inside the app](#where-to-find-the-version-number-inside-the-app)
-   [Development Setup](#development-setup)
    -   [Prerequisites](#prerequisites)
    -   [Get Started with Development](#get-started-with-development)
    -   [Connect with database](#connect-with-database)
    -   [Symfony commands](#symfony-commands)
    -   [Imported endpoints](#imported-endpoints)
    -   [Running Behat Tests](#running-behat-tests)
    -   [Running Frontend Tests](#running-frontend-tests)
    -   [Testing the SAML Authentication locally](#testing-the-saml-authentication-locally)
-   [Creating test users on the prod system](#creating-test-users-on-the-prod-system)
-   [Prodsystem and Testsystem](#prodsystem-and-testsystem)
    -   [Connecting via SSH to the production server](#connecting-via-ssh-to-the-production-server)
        -   [Prerequisites](#prerequisites-1)
        -   [Setup](#setup)
        -   [Connect](#connect)
        -   [Connect to the Production Database](#connect-to-the-production-database)
    -   [Ansible Setup](#ansible-setup)
    -   [Firewall rules](#firewall-rules)
    -   [Automatic Updates](#automatic-updates)
    -   [Monitoring](#monitoring)
        -   [Uptime-robot](#uptime-robot)
        -   [Netdata](#netdata)
            -   [Access the GUI](#access-the-gui)
    -   [Deployment via Gitlab CI](#deployment-via-gitlab-ci)
    -   [How to remove a Video from Prod](#how-to-remove-a-video-from-prod)
    -   [Additional Notes](#additional-notes)
-   [Known Issues](#known-issues)
    -   [(random) Unexpected Behavior (i.e. Login suddenly not working)](#random-unexpected-behavior-ie-login-suddenly-not-working)

<!-- vim-markdown-toc -->

## Making a versioned release

To create and deploy a versioned release follow these steps:

> **NOTE**: The tag you create **has to adhere to semantic versioning naming rules**!
>
> -   1.2.3 **works**
> -   v1.2.3 **works**
> -   V1.2.3 **works**
> -   1.2.3-test-1 **works**
> -   something-1-2-3 **does not work**
> -   $1.2.3 **does not work**
> -   1.2 **does not work**
>     For further details have a look at the regex inside `scripts/versioning.sh`

1. Create a tag (inside the remote repository) on the branch you would like to deploy (e.g. `master`)
2. Inside **GitLab** open CI/CD->Pipelines
3. Choose the branch you would like to deploy and run the pipeline
4. Trigger the manual deploy step (either for our test system or the prod system)

### Special notes on master releases

If you are creating a release on master, please make sure to also create a release inside the
gitlabe repository, link it with the tag you created (or do both inside a single step) and
also add a meaningful changelog to the release (see past releases).

### Where to find the version number inside the app

1. You can find the version number inside the footer of the login screen
2. The version is accessible as a global javascript variable `degreeVersion`

## Development Setup

### Prerequisites

-   docker & docker-compose
-   Make
-   yarn (cd api && nvm use && npm install yarn -g)

### Get Started with Development

-   Initially, run `make build-docker` to build the docker container
-   run `docker-compose up -d`
-   check installation with `docker-compose logs -f api`
-   When the container is running:
    -   import fixtures by running `make import-fixtures` (dummy data)
    -   Run the assets build (locally) using `cd api && nvm use && yarn`
    -   Run frontend build using `cd api && yarn dev`
    -   Run the assets watcher (locally) using `cd api && nvm use && yarn encore dev --watch`
    -   After installation is successful, go to `http://localhost:8080/login` and log in with `admin@sandstorm.de / password`
    -   The Symfony Console can be executed via `./symfony-console`

### Connect with database

-   mariadb
    -   db: api
    -   user: api-platform
    -   pw: !ChangeMe!
    -   host: localhost:13306

### Symfony commands

-   ./symfony-console cache:clear
-   ./symfony-console make:entity
-   ./symfony-console make:migration
-   ./symfony-console doctrine:migrations:migrate
-   ./symfony-console messenger:consume async -vv
-   ./symfony-console messenger:consume async -vv --limit=1

-   Debug commands:
    -   for re-encoding a single video: ./symfony-console app:enqueue-video-encoding ac40cc6c-ad1f-4af0-881a-47d65cbae66d

### Imported endpoints

-   http://localhost:8080
-   http://localhost:8080/login
    -   login with: admin@sandstorm.de / password
-   http://localhost:8080/admin/
-   http://localhost:8080/subtitle-editor

### Running Behat Tests

1. Start our docker-compose setup
2. run `make test`

> **NOTE**: We need the api container to create an environemnt to run our tests
> in. However we currently do not use the actual running application and database.
> Our test setup creates its own test instance + database inside the running container.

**troubleshooting for Behat Tests**

When seeing the following error

```
SQLSTATE[HY000] [1044] Access denied for user ‘api-platform’@‘%’ to database ‘app_test’
```

Try to connect to the local db and execute the following script

```
CREATE DATABASE app_test;
GRANT ALL ON app_test.* TO 'api-platform'@'%';
```

### Running Frontend Tests

yarn jest
yarn test:debug

### Testing the SAML Authentication locally

In order to test the SAML authentication locally, you need the following `/etc/hosts` entry:

```
127.0.0.1 degree40.tu-dortmund.de
```

-   now, browse to [https://degree40.tu-dortmund.de](https://degree40.tu-dortmund.de) and accept the certificate warning.
-   then, press the `SAML Login` link, and log in at TU dortmund (credentials in vault)

After testing, **remember to remove the `/etc/hosts` entry again** - as you still want to access the staging system.

The development container contains a self-signed SSL certificate and nginx is serving via SSL on port 8443 - so everything
is prepared for testing the SAML authentication locally.

## Creating test users on the prod system

1. Connect via ssh to the server `ssh <username>@degree40.tu-dortmund.de`
2. Become the **deployment** user by typing `sudo su - deployment` (keep your server-user password ready)
3. Enter the docker container: `docker-compose exec api bash`
4. Make sure you are inside the `app/` directory and otherwise type `cd /app`
5. Run our CLI command for user creation:
   `./bin/console app:create-user <email> <password>`
6. Login as admin at https://degree40.tu-dortmund.de (credentials in bitwarden)
7. Navigate to the **administration** page
8. Search for your newly created user and click **edit**
9. Give the user its respective role (e.g. _student_)

You should now be able to add the user to courses etc.

## Prodsystem and Testsystem

The Prod System is `degree40.tu-dortmund.de`. The Test system is `degree40-test.tu-dortmund.de`.

-   If you connect via SSH (and the config below), you can go to `http://localhost:19999` to access Netdata monitoring.

### Connecting via SSH to the production server

#### Prerequisites

You need an account on gitlab-runner.sandstorm.de - try connecting via `ssh -p 29418 gitlab-runner.sandstorm.de` (TOUCH YUBIKEY!)

#### Setup

You need the following entries in `~/.ssh/config`:

(replace YOUR-USERNAME-ON-GITLAB-RUNNER with the right username)

```
Host gitlab-runner.sandstorm.de
  Port 29418
  User YOUR-USERNAME-ON-GITLAB-RUNNER
  ForwardAgent yes

Host degree40.tu-dortmund.de
  ProxyJump gitlab-runner.sandstorm.de
  # MariaDB
  LocalForward 23306 127.0.0.1:3306
  # Netdata Monitoring
  LocalForward 19999 127.0.0.1:19999

Host degree40-test.tu-dortmund.de
  ProxyJump gitlab-runner.sandstorm.de
  # MariaDB
  LocalForward 23306 127.0.0.1:3306
  # Netdata Monitoring
  LocalForward 19999 127.0.0.1:19999
```

#### Connect

-   Run `ssh [your-username]@degree40.tu-dortmund.de`
-   Touch your Yubikey TWICE
-   Now, you can become the **deployment** user (which runs `docker-compose`):
    `sudo su - deployment`
-   To enter the container, use the following commmand:
    `docker-compose exec api /bin/bash`

#### Connect to the Production Database

-   Prod database is a MariaDB
-   Run the SSH command as above(`ssh [your-username]@degree40.tu-dortmund.de`), keep the connection open
-   Connect (e.g. in Sequel Pro or IntelliJ) using the following settings:
    -   Host: 127.0.0.1
    -   Port: 23306
    -   User: api-platform
    -   Password: see bitwarden vault
    -   DB: api

### Ansible Setup

The ansible setup is run from the local computer; not from any CI pipeline (so far).

```
cd deployment/prod-server/ansible

# !! ensure login_user is set to your user, and you can run `sudo`
edit inventories/production.yml # and change the login_user to your login user on the server

ansible-playbook -i inventories/production.yml -K server.yml
```

Ansible takes care of:

-   adding/configuring users
-   hardening the server (SSH config; TODO firewall)
-   installing `docker`

### Firewall rules

-   Docker is BEFORE the firewall; so that means we do not need FW rules for the docker ports like 80/443
-   To allow access from the gitlab-runner.sandstorm.de, we used: `ufw allow proto tcp from 88.198.132.154 to any port 22`

### Automatic Updates

Automatic updates are configured without ansible by doing the following:

```
sudo apt-get install unattended-upgrades
# if the configuration dialog does not open, run:
dpkg-reconfigure -plow unattended-upgrades
# now, select YES when asked the question whether you want to do automatic updates.
```

**Automatic updates only take care of security fixes.** For "general updates" of all packages,
it is useful to run the following commands every once in a while:

```
apt-get update
apt-get upgrade
apt autoremove
```

### Monitoring

#### Uptime-robot

-   The system is monitored by uptime robot (credentials in bitwarden)

#### Netdata

-   Netdata collects system information and sends warnings to our `monitoring-production`-channel in slack
-   Note that our netdata path differs from the official docs.
    So you have to use `/opt/netdata/etc/netdata/...` instead of `/etc/netdata/...`
-   Slack warnings are configured inside `health_alarm_notify.conf` (`SLACK_WEBHOOK_URL`, `DEFAULT_RECIPIENT_SLACK="#"`)
-   Our `/opt/netdata/etc/netdata/netdata.conf` has been changed to the following:

```conf
[global]
    ...
    update every = 5
    memory mode = dbengine
    page cache size = 64
    dbengine disk space = 1000
    ...
[web]
    ...
    bind to = 127.0.0.1
    ...
`
```

##### Access the GUI

Connect to the degree server via ssh using the config above.
This will forward port `19999` to localhost, so you can open the gui on `http://localhost:19999`.

### Deployment via Gitlab CI

> Make sure you increase the app version in `/api/templates/Version.html.twig`!

-   When a pipeline on master succeeds you can manually trigger a deployment step.

### How to remove a Video from Prod

> Admin should be able to do this inside the plattform

-   Connect to Prod DB (see above)
-   Look for video in `video` table and "memorize" id
-   Delete references in tables:
    -   `video_course`
    -   `exercise_phase_video`
    -   `video`
    -   `video_subtitles`
-   These are all reference _we_ found for now. There might be more in `exercise_phase*` if the video was used in a phase.

### Additional Notes

-   The app partition is mounted to `/data` and is 100 GB size. the system partition is 20 GB big.
    -   This is done via the following `/etc/fstab` entry (required for automatic mounting on boot):
        ```
        /dev/sda3 /data/         auto     defaults 0 2
        ```
-   In `/data`, there exist all the docker files; and the persistent volumes from the Degree project.
-   The `home/deployment/data` directory has been symlinked to `/data/degree-data`
-   The docker image location has been changed to `/data/docker` by adding the following `docker/daemon/json` to `/etc/` :

```json
{
    "data-root": "/data/docker"
}
```

## Known Issues

### (random) Unexpected Behavior (i.e. Login suddenly not working)

-   The current production system does not have a lot of resources and runs `out of space` quickly.
-   As quick fix try to remove unused docker resources with `docker system prune`.
-   Hint: to see how much disc space docker is using, run: `docker system df`.
