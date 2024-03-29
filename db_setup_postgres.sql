-- create users
DROP USER IF EXISTS instantchatuser;
CREATE USER instantchatuser WITH PASSWORD 'instantpwchat';

-- create database
DROP DATABASE IF EXISTS instantchat;
CREATE DATABASE instantchat OWNER instantchatuser;

-- change to new database
\connect instantchat

-- create tables
CREATE TABLE users (
	id	BIGSERIAL NOT NULL PRIMARY KEY,
	name	varchar(100),
	timestamp timestamp DEFAULT now()
);

CREATE TABLE message (
	id BIGSERIAL NOT NULL PRIMARY KEY,
	-- Need not null after users implementation --
	userid BIGSERIAL NOT NULL,
	message varchar(255) NOT NULL,
	timestamp timestamp DEFAULT now(),
	FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE
);

CREATE VIEW message_view AS
	SELECT message.id, users.name, message.message, message.timestamp
	FROM message, users 
	WHERE message.userid = users.id;

-- grant rights
ALTER TABLE users OWNER TO instantchatuser;
ALTER TABLE message OWNER TO instantchatuser;
ALTER TABLE message_view OWNER TO instantchatuser;

-- create functions
CREATE LANGUAGE plpgsql;

-- getcreateusers
CREATE OR REPLACE FUNCTION getcreateuser (username varchar(100))
RETURNS BIGINT
AS $body$
DECLARE
	userid BIGINT;
BEGIN
	IF NOT EXISTS (SELECT * FROM users WHERE users.name = username) THEN
		INSERT INTO users (name) VALUES (username);
	END IF;
	SELECT id INTO userid FROM users WHERE users.name = username;
	RETURN userid;
END;
$body$
LANGUAGE plpgsql;

-- checknewmessages
CREATE OR REPLACE FUNCTION checknewmessages (lastid BIGINT)
RETURNS INT
AS $body$
BEGIN
	IF EXISTS (SELECT id FROM message WHERE message.id > lastid) THEN
		RETURN 1;
	ELSE
		RETURN 0;
	END IF;
END;
$body$
LANGUAGE plpgsql;

-- addmessage
CREATE OR REPLACE FUNCTION addmessage (newuserid BIGINT, newmessage varchar(255))
RETURNS BIGINT
AS $body$
DECLARE
	messageid BIGINT;
BEGIN
	INSERT INTO message (userid, message) VALUES (newuserid, newmessage);
	SELECT id INTO messageid FROM message ORDER BY id DESC LIMIT 1;
	RETURN messageid;
END;
$body$
LANGUAGE plpgsql;
