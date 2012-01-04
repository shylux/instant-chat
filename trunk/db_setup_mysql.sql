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
CREATE TABLE users (
	id	BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	name	varchar(100),
	timestamp timestamp DEFAULT now()
) ENGINE=INNODB;

CREATE TABLE channels (
	id	BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	name	varchar(100) NOT NULL UNIQUE,
	enc	boolean NOT NULL DEFAULT False,
	hidden	boolean NOT NULL DEFAULT False
) ENGINE=INNODB;
INSERT INTO channels (name, enc, hidden) VALUES ("public", false, false);

CREATE TABLE message (
	id		BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	-- Need not null after user implementation --
	userid		BIGINT,
	channelid 	BIGINT DEFAULT 0,
	message		varchar(255) NOT NULL,
	timestamp	timestamp DEFAULT now(),
	FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (channelid) REFERENCES channels(id) ON DELETE CASCADE
) ENGINE=INNODB;

CREATE VIEW message_view AS
	SELECT message.id, channels.name as channelname, users.name, message.message, message.timestamp
	FROM message, users, channels
	WHERE message.userid = users.id
	AND message.channelid = channels.id;

-- create functions
delimiter //

-- getcreateuser
DROP FUNCTION IF EXISTS getcreateuser//
CREATE FUNCTION getcreateuser (username varchar(100))
RETURNS BIGINT
BEGIN
	DECLARE userid BIGINT;
	If NOT Exists (SELECT * FROM users WHERE users.name = username) THEN
		INSERT INTO users (name) VALUES (username);
	END IF;
	SELECT id INTO userid FROM users WHERE users.name = username;
	RETURN userid;
END//

-- checknewmessages
DROP FUNCTION IF EXISTS checknewmessages//
CREATE FUNCTION checknewmessages (lastid BIGINT)
RETURNS BOOLEAN
BEGIN
	If Exists (SELECT id FROM message WHERE channelid = getchannelbyname("public") AND message.id > lastid) THEN
		RETURN True;
	ELSE
		RETURN False;
	END IF;
END//

-- checknewmessagesbychannel
DROP FUNCTION IF EXISTS checknewmessagesbychannel//
CREATE FUNCTION checknewmessagesbychannel (lastid BIGINT, channelname varchar(100))
RETURNS BOOLEAN
BEGIN
	If Exists (SELECT id FROM message WHERE channelid = getchannelbyname(channelname) AND message.id > lastid) THEN
		RETURN True;
	ELSE
		RETURN False;
	END IF;
END//

-- getchannelbyname
DROP FUNCTION IF EXISTS getchannelbyname//
CREATE FUNCTION getchannelbyname (channelname varchar(100))
RETURNS BIGINT
BEGIN
	DECLARE channelid BIGINT;
	SELECT id INTO channelid FROM channels WHERE name = channelname;
	RETURN channelid;
END//

-- addmessage
DROP FUNCTION IF EXISTS addmessage//
CREATE FUNCTION addmessage (newuserid BIGINT, newmessage varchar(255))
RETURNS BIGINT
BEGIN
	DECLARE messageid BIGINT;
	INSERT INTO message (userid, channelid, message) VALUES (newuserid, getchannelbyname("public"), newmessage);
	SELECT id INTO messageid FROM message GROUP BY id DESC LIMIT 1;
	RETURN messageid;
END//

-- addmessagetochannel
DROP FUNCTION IF EXISTS addmessagetochannel//
CREATE FUNCTION addmessagetochannel (newuserid BIGINT, channelname varchar(100), newmessage varchar(255))
RETURNS BIGINT
BEGIN
	DECLARE messageid BIGINT;
	INSERT INTO message (userid, channelid, message) VALUES (newuserid, getchannelbyname(channelname), newmessage);
	SELECT id INTO messageid FROM message GROUP BY id DESC LIMIT 1;
	RETURN messageid;
END//
