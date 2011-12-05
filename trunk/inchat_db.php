<?php

class Inchat_db {
	private $ready = false;

	static private $instance = null;
	static public function getInstance() {
		if (null === self::$instance) {
			self::$instance = new self;
		}
		return self::$instance;
	}
	private function __clone() {}
	private function __construct() {
	}
	/**
	* Create DB connection based on which database is selected.
	* $db_string: "mysql" and "postgres" are supported.
	*/
	public function setup($db_string) {
		switch ($db_string) {
			case "mysql":
				$link = mysql_pconnect(INCHAT_DB_HOST, INCHAT_DB_USER, INCHAT_DB_PW);
				if (!$link) die ("Can't connect to Database-Server: ".mysql_error());

				$db = mysql_select_db(INCHAT_DB_NAME, $link);
				if (!$db) die ("Can't change to Database: ".mysql_error());

				echo "setup mysql";
				break;
			case "postgres":
				echo "setup postgres";
				break;
			default:
				echo "Database type not supported.";
				return;
		}
		$this->ready = true;
	}

	public function isReady() {
		return $ready;
	}

	public function query($query_string) {
		if (!$ready) {
			echo "Database not ready.";
			return;
		}

		switch ($db_string) {
			case "mysql":
				$resource = mysql_query($query_string);
				if (!$resource) {
					echo "Query error.";
					return null;
				}
				return $resouce;
			case "postgres":
				echo "postgres query not implemented";
				break;
			default:
				echo "Database type not supported.";
		}
	}
}

$db = Inchat_db::getInstance();
$db->setup('mysql');

?>
