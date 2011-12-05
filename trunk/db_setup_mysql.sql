-- mysql -u root -p < db_setup.sql --

-- create user
GRANT USAGE ON *.* TO instantchatuser;
DROP USER instantchatuser;
CREATE USER instantchatuser IDENTIFIED BY 'instantpwchat';

-- create database
DROP DATABASE IF EXISTS instantchat;
CREATE DATABASE instantchat;
GRANT ALL ON instantchat.* TO instantchatuser;

-- change to new database
USE instantchat;

-- create tables
CREATE TABLE user (
	id	BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	name	varchar(100),
	timestamp timestamp DEFAULT now()
) ENGINE=INNODB;

CREATE TABLE message (
	id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	-- Need not null after user implementation --
	user BIGINT,
	message varchar(255) NOT NULL,
	timestamp timestamp DEFAULT now(),
	FOREIGN KEY (user) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=INNODB;


-- create functions
delimiter //

-- getcreateuser
DROP FUNCTION IF EXISTS getcreateuser//
CREATE FUNCTION getcreateuser (username varchar(100))
RETURNS BIGINT
BEGIN
	DECLARE userid BIGINT;
	If NOT Exists (SELECT * FROM user WHERE user.name = username) THEN
		INSERT INTO user (name) VALUES (username);
	END IF;
	SELECT id INTO userid FROM user WHERE user.name = username;
	RETURN userid;
END//

-- checknewmessages
DROP FUNCTION IF EXISTS checknewmessages//
CREATE FUNCTION checknewmessages (lastid BIGINT)
RETURNS BOOLEAN
BEGIN
	If Exists (SELECT id FROM message WHERE message.id > lastid) THEN
		RETURN True;
	ELSE
		RETURN False;
	END IF;
END//

-- addmessage
DROP FUNCTION IF EXISTS addmessage//
CREATE FUNCTION addmessage (userid BIGINT, newmessage varchar(255))
RETURNS BIGINT
BEGIN
	DECLARE messageid BIGINT;
	INSERT INTO message (user, message) VALUES (userid, newmessage);
	SELECT id INTO messageid FROM message GROUP BY id DESC LIMIT 1;
	RETURN messageid;
END//
