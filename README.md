# Degree 4.0

<!-- vim-markdown-toc GitLab -->

-   [Making a versioned release](#making-a-versioned-release)
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
    -   [Prod Partition Setup](#prod-partition-setup)
-   [Known Issues](#known-issues)
    -   [(random) Unexpected Behavior (i.e. Login suddenly not working)](#random-unexpected-behavior-ie-login-suddenly-not-working)
-   [Backups](#backups)
-   [Updating Datenschutzerklärung](#updating-datenschutzerklärung)
-   [Updating SAML IDP Certificate of TU Dortmund](#updating-saml-idp-certificate-of-tu-dortmund)

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

> **Note**: Deployments now currently only work from tags and no longer directly from branches.
> If you would like to make a deployment to the test-system please create a tag on `dev` an deploy it.
> It might be helpful to postfix the version with `-dev` (e.g. **v1.2.3-dev-1**).

0. Make sure that the respective branch is up-to-date (also see [main notes](#special-notes-on-main-releases))
1. Create a tag (inside the remote repository) on the branch you would like to deploy (e.g. `main`)
2. Inside **GitLab** open CI/CD->Pipelines
3. A pipeline will be running for the tag choose this one
4. Trigger the manual deploy step (either for our test system or the prod system)

### Where to find the version number inside the app

1. You can find the version number inside the footer of the login screen
2. The version is accessible as a global javascript variable `degreeVersion`

## Development Setup

### Prerequisites

- docker & docker-compose
- Make
- Set up the FontAwesomePro token in `.npmrc` (see `api/.npmrc.sample` for detailed instructions) 
- yarn (cd api && nvm use && npm install yarn -g)

### Get Started with Development

- Initially, run `make build-docker` to build the docker container
- run `make start`
- check installation with `make logs-api`
- When the container is running:
    - import fixtures by running `make import-fixtures` (dummy data)
    - Run the assets build (locally) using `cd api && nvm use && yarn` 
      (if it fails because it can't access FontAwesomePro, have a look at Prerequisites)
    - Run frontend build using `cd api && yarn dev`
    - Run the assets watcher (locally) using `cd api && nvm use && yarn encore dev --watch`
    - After installation is successful, go to `http://localhost:8080/login` and log in with `admin@sandstorm.de / password`
    - Or to login as student use: `student@sandstorm.de / password` or `student2@sandstorm.de / password`
    - The Symfony Console can be executed via `./symfony-console`

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

1. Install e2e-testrunner dependencies: `cd e2e-testrunner && npm install`
2. Start e2e-testrunner: `node index.js`
3. Start docker containers `docker-compose up -d`
4. Enter `api` container `docker-compose exec api /bin/bash`
5. execute tests
   1. Integration: `make test-integration`
   2. End to end: `make test-e2e`
   3. All tests: `make test`
6. use the `--tags` flag to run specific tests (i.e. `--tags myTest`)

> **NOTE**: We added the DATABASE_URL in point 5 as inline ENV because the .env.test file does not seem to work here anymore.
> We should fix this but we don't have the time right now.

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

**You can also use app.netdata.cloud (credentials in Vault) to access the Server Metrics.**

Connect to the degree server via ssh using the config above.
This will forward port `19999` to localhost, so you can open the gui on `http://localhost:19999`.

### How to remove a Video from Prod

> Admin should be able to do this inside the plattform

-   Connect to Prod DB (see above)
-   Look for video in `video` table and "memorize" id
-   Delete references in tables:
    -   `video_course`
    -   `exercise_phase_video`
    -   `video`
-   These are all reference _we_ found for now. There might be more in `exercise_phase*` if the video was used in a phase.

### Prod Partition Setup

-   the system partition is 20 GB big.
-   The app partition is mounted to `/data` and is 600 GB size. This is a LVM array of the following parts:
    -   /dev/sda4 (500 GB)
    -   /dev/sda3 (100 GB)
-   We currently have a SPARE partition (the old /data partition, before 2021-06-24, mounted on /data-old, being 100 gb in size). We do NOT include this in the LVM array right now, as this makes the backup restore process potentially more
    difficult when multiple partitions are invol

For the TEST environment, we simply mount /dev/sda3 to /data, and this is 100 GB in size. This is done using the
following /etc/fstab entry (required for automatic mounting on boot)::

```
/dev/sda3 /data/         auto     defaults 0 2
```

For the PROD environment, we changed the setup to use Logical Volumes Management (LVM) to be able to grow the
data partition more and more, take snapshots etc. For an intro to LVM, see [this blog post](https://www.thomas-krenn.com/de/wiki/LVM_Grundkonfiguration).

LVM has been setup in the following way for the data partitions:

```bash
#
# This is just for DOCUMENTATION and REFERENCE purposes. ADDING a new disk to the LVM array
# looks slightly different:
#

cfdisk /dev/sda
# now create new partition (in our case /dev/sda4) of type "8e, Linux LVM"

# 1) Create a PV (Persistent Volume) which we can later add to a volume group.
pvcreate /dev/sda4 --metadatasize 1000k
pvs # show PVs
pvdisplay # show PVs

# 2) Create a VG (Volume Group) from the Persistent Volume
vgcreate vg00 /dev/sda4
vgdisplay # show VGs

# 3) Create a LV (Logical Volume) inside the Volume Group
lvcreate -n data -l100%VG vg00
lvdisplay # show LVs

# 4) Create the Ext4 partition in the newly created LV
mkfs.ext4 /dev/vg00/data
```

To ADD new storage, this works the following way:

```bash
# follow https://techmomblog.wordpress.com/2013/06/06/grow-extend-an-lvm-on-a-linux-vm/
cfdisk /dev/sd  a    # create new partition
partprobe /dev/sda # load the new partition into the partition table
vgdisplay # check how the VG is named (e.g. "vg00")
vgextend vg00 /dev/sda3 # sda3 is the new partition in the example
lvextend -L +100G /dev/vg00/data
resize2fs /dev/vg00/data
```

-   In `/data`, there exist all the docker files; and the persistent volumes from the Degree project.
-   The `home/deployment/data` directory has been symlinked to `/data/degree-data`
-   The docker image location has been changed to `/data/docker` by adding the following `docker/daemon/json` to `/etc/` :

    ```json
    {
        "data-root": "/data/docker"
    }
    ```

## Environment variable resolution

Degree has three different environment states it could be in:

1. `dev` - our local development environment
2. `test` - our local test environment as well as the test env for our CI
3. `prod` - environment for the prod system (deployed to `degree40-test.tu-dortmund.de` or `degree40.tu-dortmund.de`)

The `APP_ENV` variable used by the system is consumed inside `public/index.php`.

### Dev
The dev environment for our local system running on port `:8080` is initiated by adding the `APP_ENV=dev` variable inside our main `docker-compose.yml`. By specifing `dev` we make sure that our server uses the `.env.dev` environment file for env resolution.

### Test

#### Local
The testsystem is running inside our dev docker container, but with its own nginx-configuration on port `:9090`. The nginx-configuration sets the `APP_ENV` for all web-based requests to that port to `test`.
Which in turn makes sure that the `.env.test` file is used for environment resolution.
To make sure that our e2e- and integrations-tests also use this environment, it needs to be specified inside the test runner cli command (see [Running Behat Tests](#running-behat-tests)).

#### CI
For local development our `.env`-files are mounted together with the rest of the `app/` directory.
We also copy `.env` as well as `.env.test` inside our Dockerfile into the image, so that they also work inside the CI (where we can't mount them).

The `APP_ENV=test` environment is set iniside the service configuration for tests in our gitlab-ci.yml.

### Prod
`APP_ENV`-Prod is being set inside our `docker-compose-prod-tu-dortmund.yml` and `docker-compose-test-tu-dortmund.yml` respectively.

## Known Issues

### (random) Unexpected Behavior (i.e. Login suddenly not working)

-   The current production system does not have a lot of resources and runs `out of space` quickly.
-   As quick fix try to remove unused docker resources with `docker system prune`.
-   Hint: to see how much disc space docker is using, run: `docker system df`.

## Backups

Backups are handled by the TU-Dortmund and include incremental snapshots of both the test system as well as the prod system
VMs.
New backups are created on a nightly basis.
These snapshots are "in-place-backups" meaning that everything that happened on the respective machine between the backup
and the restoration will be thrown away and the machine will be restored to the state it was in during the backup.
Restoration is also handled by the TU-Dortmund (just make a call).

## Updating Datenschutzerklärung

1. Set `TERMS_OF_USE_VERSION` in `api/src/Security/Voter/TermsOfUseVoter.php` to a new (higher) value. This will indicate that users have to accept a new version.
2. Update the text in `api/templates/Partials/TermsOfUseContent.html.twig`

## Updating SAML IDP Certificate of TU Dortmund

It happens that the certificate of the SAML Identity Provider (IDP) of TU Dortmund changes.
In that case the SAML login would not work with the old certificate and we have to update it on our end:

1. There should be an email from TU Dortmund's ITMC that notifies all Service Providers (SP) about this change
2. In that mail there should be information about the new certificate (in `xml` and/or `pem` form)
3. Paste the new certificate into the `hslavich_onelogin_saml.idp.x509cert` setting in `api/config/packages/hslavich_onelogin_saml.yaml`
4. Push-Tag-Release should be enough to apply the changes to production
