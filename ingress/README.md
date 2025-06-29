# Ingress and Instance Setup

> We want an as easy as possible setup to automatically generate new instances on prod with simple and fast
> local development for this mechanism.

This directory contains the automated scripts to generate a new degree instance on the servers.

Those scripts support three targets:

* `prod` - for the actual production server. This will use `ssh/scp` as connection, copy directories and execute the setup scripts
* `test` - same as prod, just for another server
* `local` - for local development. This will skip the `ssh/scp`-connection part and just use the local filesystem.

There are two scripts you can execute:

* `setup_ingress.sh` - will set up the caddy-ingress and global maria-db and create default folder structure
* `setup-instance.sh` - will create/update a new instance, copy env and start the degree container

## Pre-requisites

* `openssl`
* `envsubst`
* `dig`

## Script concept

Both scripts got two stages. The actual script you execute (`setup_ingress.sh` or `setup_instance.sh`) will copy the
actual working script (`..on_target.sh`) and all required files to the target system.

## Persistent Data
The persistent data for the degree instances is stored in the `/data/<instance-name>-data` directory on the server.

Make sure that `/data` is writable!: `chown 777 /data`.

If the user that executes the script is not permitted to write to `/data`, the script will fail.

## Testing locally

### Pre-requisites

* `openssl`
* `envsubst`
* `dig`

### Docker Hub Access

Needed to pull the current degree container. Create a new personal access token in gitlab and use it as password.

```
docker login docker-hub.sandstorm.de
```

### Setup and start local runtime


```shell
dev localSetup
dev localSetupInstance testinstance
```

`dev localSetup` will begin by nuking the local-runtime for the auto ingress-instance-setup. Then setup the deployments
directory and start the global ingress-caddy and mariadb instance.

### Removing an Instance on Server
```shell
# enter the server
ssh degree40.tu-dortmund.de
# become root
sudo su
# become deployment user
su - deployment
# enter the instance directory
cd deployments/test
# stop the instance
docker compose down
#> [+] Running 3/3
#> ✔ Container test-degree-1  Removed                                                                                                                                                                                                           10.3s
#> ✔ Container test-redis-1   Removed                                                                                                                                                                                                            0.2s
#> ✔ Network test-network     Removed                                                                                                                                                                                                            0.1s
cd ..
# remove the instance directory
rm -r test
# enter db service
cd ingress/
docker compose exec db bash
# remove database and user of instance
mysql -u root -p$MYSQL_ROOT_PASSWORD

MariaDB [(none)]> DROP DATABASE test;
#> Query OK, 20 rows affected (0.029 sec)

MariaDB [(none)]> DROP USER test;
#> Query OK, 0 rows affected (0.001 sec)

# exit db
MariaDB [(none)]> exit
#> Bye

# exit db service
exit
# exit deployment user
exit

# rm instance data directory
cd /data/
rm -r test-data/

# exit server
exit
exit
#> Connection to degree40.tu-dortmund.de closed.
```

### Migrating old deployment on server to new setup

```shell
# ssh and become deployment user
ssh robert@degree40-test.tu-dortmund.de
su root
su deployment
cd ~

# add your yubikey to deployment authorized_keys
vim .ssh/authorized_keys
ssh deployment@<server>

# prevent new data from being created
docker compose stop degree traefik

# create database dump
docker compose exec db bash
mysqldump -uroot -p$MYSQL_ROOT_PASSWORD  degree > degree_backup.sql
mv degree_backup.sql /var/lib/mysql/
exit
cp data/mysql/degree_backup.sql .

# quick look into the degree_backup.sql; there must be data
less degree_backup.sql

# back to root, back to robert, leave the server
exit

# on your local machine => init caddy and database
dev testSetup

# on the server, create the .secrets.env file
ssh deployment@degree40-test.tu-dortmund.de
cat .env # copy MAILER_DSN and MAILER_SENDER_ADDRESS from old .env file
cd deployments
vim .secrets.env # paste values from old env file
exit

# locally
# create degree on test server
# !Make sure you are logged in to sandstorm docker hub
dev testSetupInstance degree degree40-test.tu-dortmund.de

# ssh and become deployment user
ssh deployment@degree40-test.tu-dortmund.de

# copy the saml env from the original .env file and paste it into .saml.env
cat .env # copy the saml block
cd deployments/degree
vim .saml.env # past saml
# apply configuration change
docker compose up -d

# import database dump
cd ~/deployments/ingress
cp ~/degree_backup.sql db-sync
docker compose exec db bash
mysql -uroot -p$MYSQL_ROOT_PASSWORD degree < /db-sync/degree_backup.sql

# clear up old deployment
cd ~
docker compose down -v
cd /data/degree-data
rm -rf mysql traefik
# only <instance-name>-data/app should exist
```
