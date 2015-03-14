**Table of Contents**


# Requirements #
The numbers in clamp are the version number of the software i use. I recommend to use the newest version but, it will work with older versions too.
  * subversion (1.6.6) - to download the project
  * mysql (14.14) - to store the messages
  * php (5.3.2) - server-side script
  * webserver (apache) - to handle the request

# Minimal Setup #

## Download the Project ##
```
svn checkout http://instant-chat.googlecode.com/svn/trunk/ instant-chat-read-only
```

## Create Database ##
### MySQL ###
```
mysql -u root -p < db_setup.sql
```
### Postgres ###
```
psql -f db_setup_postgres.sql
```
Note: The current user needs database create rights.

## Modul for PHP ##
### MySQL ###
You have to load the mysql modul for php. Restart the webserver after that.
```
a2enmod <mysql-modul>
service apache2 restart
```

# Advanced Functions #

## Memcached ##
Memcached is an in-memory key-value store. I use it to check wheter there is a new message or not.
Without memcached i have to do mysql querys which results in a bad performance for the webserver.

```
sudo apt-get install memcached
a2enmod mem_cache

vi inchat.php
$MEMCACHE_ENABLED = true;
```