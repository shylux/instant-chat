<?php

class Inchat_db {
	private $ready = false;
	private $db_string = "";
	
	const MYSQL = "mysql";
	const POSTGRES = "postgres";
	const INVALID = "Database type not supported.";
	

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
	public function setup_constant($db_string) {
		switch ($db_string) {
			case "mysql":
				self::setup($db_string, INCHAT_DB_HOST, INCHAT_DB_NAME, INCHAT_DB_USER, INCHAT_DB_PW);
				break;
			case "postgres":
				break;
			default:
				echo self::INVALID;
				return;
		}
	}

	public function setup($db_string, $db_host=false, $db_name=false, $db_user=false, $db_pw=false) {
		if (!$db_host || !$db_name || !$db_user || !$db_pw) {
			$this->setup_constant($db_string);
			return;
		}
		switch ($db_string) {
			case self::MYSQL:
				$link = mysql_pconnect($db_host, $db_user, $db_pw);
				if (!$link) die ("Can't connect to Database-Server: ".mysql_error());

				$db = mysql_select_db($db_name, $link);
				if (!$db) die ("Can't change to Database: ".mysql_error());

				break;
			case self::POSTGRES:
				pg_connect("host=".$db_host." dbname=".$db_name." user=".$db_user." password=".$db_pw)
					or die("Can't connecto to Database: ".pg_last_error());
				break;
			default:
				echo $invalid_str;
				return;
		}
		$this->ready = true;
		$this->db_string = $db_string;
	}

	public function isReady() {
		return $ready;
	}

	/**
	* I dont recommend to use query directly.
	*/
	public function query($query_string) {
		if (!$this->ready) {
			echo "Database not ready.";
			return;
		}

		switch ($this->db_string) {
			case self::MYSQL:
				$resource = mysql_query($query_string);
				if (!$resource) {
					die("Query Error: ".mysql_error());
				}
				return $resource;
			case self::POSTGRES:
				$resource = pg_query($query_string);
				if (!$resource) {
					die ("Query Error: ".pg_last_error());
				}
				return $resource;
			default:
				echo "Database type not supported.";
		}
	}

	public function escape($str) {
		switch($this->db_string) {
			case self::MYSQL:
				return mysql_escape_string($str);
			case self::POSTGRES:
				return pg_escape_string($str);
			default:
				return $str;
		}
	}

	public function fetch_array($res) {
		switch($this->db_string) {
			case self::MYSQL:
				return mysql_fetch_array($res);
			case self::POSTGRES:
				return pg_fetch_array($res);
			default:
				return array();
		}
	}
	public function fetch_object($res) {
		switch($this->db_string) {
			case self::MYSQL:
				return mysql_fetch_object($res);
			case self::POSTGRES:
				return pg_fetch_object($res);
			default:
				return new object;
		}
	}

	/**
	* Counts new messages.
	* Param: $index -> actual message id
	* Return: true if new message
	*/
	public function isNewMsg($index) {
		$query = "SELECT checknewmessages('".$this->escape($index)."')";
		$res = $this->query($query);
		$re_arr = $this->fetch_array($res);
		return (boolean)$re_arr[0];
	}

	/**
	* Gets the userid from a username. If the username doesent exists it will create a new entry.
	* Param: $username -> Username
	* Return: user id
	*/
	public function getUser($username) {
		$query = "SELECT getcreateuser('".$this->escape($username)."')";
		$res = $this->query($query);
		$re_arr = $this->fetch_array($res);
		return (int)$re_arr[0];
	}

	/**
	* Adds a message
	* Param: $userid -> if of sender, $message -> message content
	* Return: message id
	*/
	public function addMessage($userid, $message) {
		$query = "SELECT addmessage(".$this->escape($userid).", '".$this->escape($message)."')";
		$res = $this->query($query);
		$re_arr = $this->fetch_array($res);
		return (int)$re_arr[0];
	}

	public function getMessages($startid, $limit) {
		$query = "SELECT * FROM message_view WHERE id > ".$this->escape($startid)." ORDER BY id DESC LIMIT ".$this->escape($limit).";";
		$res = $this->query($query);
		$result_array = array();
		while ($row=$this->fetch_object($res)) {
			$row->timestamp = date('Y-m-d H:i:s', strtotime($row->timestamp));
			$row->message = htmlspecialchars($row->message);
			array_push($result_array, $row);
		}
		$result_array = array_reverse($result_array);
		return $result_array;
	}
}

/*
Inchat_db::getInstance()->setup("postgres", 'localhost', 'instantchat', 'instantchatuser', 'instantpwchat');
var_dump( Inchat_db::getInstance()->isNewMsg(1) );
*/

?>
