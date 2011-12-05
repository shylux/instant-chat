-- create user
DROP USER IF EXISTS instantchatuser;
CREATE USER instantchatuser WITH PASSWORD 'instantpwchat';

-- create database
DROP DATABASE IF EXISTS instantchat;
CREATE DATABASE instantchat OWNER instantchatuser;

-- change to new database
\connect instantchat

-- create tables
CREATE TABLE "user" (
	id	BIGSERIAL NOT NULL PRIMARY KEY,
	name	varchar(100),
	timestamp timestamp DEFAULT now()
);

CREATE TABLE "message" (
	id BIGSERIAL NOT NULL PRIMARY KEY,
	-- Need not null after user implementation --
	"user" BIGSERIAL NOT NULL,
	message varchar(255) NOT NULL,
	timestamp timestamp DEFAULT now(),
	FOREIGN KEY ("user") REFERENCES "user"(id) ON DELETE CASCADE
);

-- create functions
CREATE LANGUAGE plpgsql;

-- getcreateuser
CREATE OR REPLACE FUNCTION getcreateuser (username varchar(100))
RETURNS BIGINT
AS $body$
DECLARE
	userid BIGINT;
BEGIN
	IF NOT EXISTS (SELECT * FROM "user" WHERE "user".name = username) THEN
		INSERT INTO "user" (name) VALUES (username);
	END IF;
	SELECT id INTO userid FROM "user" WHERE "user".name = username;
	RETURN userid;
END;
$body$
LANGUAGE plpgsql;

-- checknewmessages
CREATE OR REPLACE FUNCTION checknewmessages (lastid BIGINT)
RETURNS BOOLEAN
AS $body$
BEGIN
	IF EXISTS (SELECT id FROM message WHERE message.id > lastid) THEN
		RETURN True;
	ELSE
		RETURN False;
	END IF;
END;
$body$
LANGUAGE plpgsql;

-- addmessage
CREATE OR REPLACE FUNCTION addmessage (userid BIGINT, newmessage varchar(255))
RETURNS BIGINT
AS $body$
DECLARE
	messageid BIGINT;
BEGIN
	INSERT INTO message ("user", message) VALUES (userid, newmessage);
	SELECT id INTO messageid FROM message ORDER BY id DESC LIMIT 1;
	RETURN messageid;
END;
$body$
LANGUAGE plpgsql;
