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

### Migrating old deployment on server to new setup

```shell
# ssh and become deployment user
ssh robert@degree40-test.tu-dortmund.de
su root
su deployment
cd ~

# add your yubikey to deployment authorized_keys
vim .ssh/authorized_keys

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
exit
exit

# on your local machine => init caddy and database
dev testSetup

# on the server, create the .secrets.env file
ssh deployment@degree40-test.tu-dortmund.de
cat .env # copy MAILER_DSN and MAILER_SENDER_ADDRESS from old .env file
cd deployments
vim .secrets.env # paste values from old env file

# create degree on test server
dev testSetupInstance degree degree40-test.tu-dortmund.de

# ssh and become deployment user
ssh robert@degree40-test.tu-dortmund.de
su root
su deployment
cd ~

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
```
