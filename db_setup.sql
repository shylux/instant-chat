-- mysql -u root -p < db_setup.sql --
GRANT USAGE ON *.* TO instantchatuser;
DROP USER instantchatuser;
CREATE USER instantchatuser IDENTIFIED BY 'instantpwchat';

DROP DATABASE IF EXISTS instantchatdb;
CREATE DATABASE instantchatdb;
GRANT ALL ON instantchatdb.* TO instantchatuser;
USE instantchatdb;

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


delimiter //

DROP FUNCTION IF EXISTS adduser//
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

DROP FUNCTION IF EXISTS addmessage//
CREATE FUNCTION addmessage (userid BIGINT, newmessage varchar(255))
RETURNS BOOLEAN
BEGIN
	INSERT INTO message (user, message) VALUES (userid, newmessage);
	RETURN TRUE;
END//
