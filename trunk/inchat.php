<?php

// Use Memcache for better performance!
$MEMCACHE_ENABLED = false;

$DB_NAME = 'instantchatdb';
$DB_USER = 'instantchatuser';
$DB_PW   = 'instantpwchat';
$DB_SERV = 'localhost';

$MAX_DELIVERED_MESSAGES = 30;

$ic = Inchat::getInstance();

if (!inchat_authenticate()) {
	$ic->send_error("Authentication failed.");
}

// Check vor valid action
if (!isset($ic->request->action)) die("No action set");


// Handle different actions
switch ($ic->request->action) {
	case "addmessage":
		addmessage();
		break;
	case "checknewmessage":
		checknewmessage();
		break;
	default:
		$ic->response->send_error('No action defined.');
}

$ic->response->respond();

/**
* Checks if the user is allowed to use the chat.
*/
function inchat_authenticate() {
	return true;
}

/**
* Gets the username.
*/
function inchat_getusername() {
	return "anonymous";
}

function addmessage() {
	$ic = Inchat::getInstance();
	if (!isset($ic->request->message)) {
		$ic->response->send_error("No Message specified.");
	}

	$username = inchat_getusername();
	$message = $ic->request->message;

	$getuser_query = "SELECT getcreateuser('".mysql_escape_string($username)."');";
	$user_res = inchat_mysql_query($getuser_query);
	$user_array = mysql_fetch_array($user_res);
	$user_id = $user_array[0];

	$add_query = "SELECT addmessage($user_id, '".mysql_escape_string($message)."');";
	$message_id_res = inchat_mysql_query($add_query);
	$message_id_array = mysql_fetch_array($message_id_res);
	$message_id = $message_id_array[0];
	if ($ic->memcache_en) $ic->memcache->set('current_message_id', $message_id);
}

function checknewmessage() {
	$ic = Inchat::getInstance();
	$lastid = (isset($ic->request->lastid)) ? $ic->request->lastid : 0;

	if ($ic->memcache_en) {
		wait_for_message_memcache();
	} else {
		wait_for_message_db();
	}

	$limit = ($ic->max_delivered_messages < $ic->request->max_messages) ? $ic->max_delivered_messages : $ic->request->max_messages;
	$query_string = "SELECT message.*, user.name FROM message, user WHERE message.user = user.id AND message.id > ".mysql_escape_string($lastid)." GROUP BY message.id DESC LIMIT ".mysql_escape_string($limit).";";
	$result = inchat_mysql_query($query_string);

	$result_array = array();
	while ($row=mysql_fetch_object($result)) {
		$row->message = htmlspecialchars($row->message);
		array_push($result_array, $row);
	}

	$ic->response->messages = $result_array;
}
function wait_for_message_db() {
	$ic = Inchat::getInstance();
	while (count_new_messages($ic->request->lastid) == 0) {
		usleep(100000);
	}
}
function wait_for_message_memcache() {
	$ic = Inchat::getInstance();
	while ($ic->get_curr_msg_id() == $ic->request->lastid) {
		usleep(50000);
	}
}
	
function count_new_messages($index) {
	$query = inchat_mysql_query("SELECT checknewmessages('".mysql_escape_string($index)."')");
	$re_array = mysql_fetch_array($query);
	return $re_array[0];
}

function inchat_mysql_query($query) {
	$ic = Inchat::getInstance();
	$recource = mysql_query($query);
	if (!$recource) {
		$ic->response->send_error("Query: ".$query."  MySQL Error: ".mysql_error());
	}
	return $recource;
}

function inchat_db_connect() {
	$DB_NAME = 'instantchatdb';
	$DB_USER = 'instantchatuser';
	$DB_PW   = 'instantpwchat';
	$DB_SERV = 'localhost';

	$link = mysql_pconnect($DB_SERV, $DB_USER, $DB_PW);
	if (!$link) die ("Can't connect to Database-Server: ".mysql_error());

	$db = mysql_select_db($DB_NAME, $link);
	if (!$link) die ("Can't change to Database: ".mysql_error());
}

class inchat_response {
	public $status = 'success';
	public $message = 'no message';
	public function respond() {
		header('Content-type: application/json');
		echo json_encode($this);
		die();
	}
	public function send_error($errorstring) {
		$this->status = 'Error';
		$this->message = $errorstring;
		$this->respond();
	}
}

class Inchat {
	public $memcache_en;
	public $memcache;
	public $db;
	public $max_delivered_messages;
	public $request;
	public $response;

	static private $instance = null;
	static public function getInstance() {
		if (null === self::$instance) {
			self::$instance = new self;
		}
		return self::$instance;
	}
	private function __clone() {}
	private function __construct() {
		global $DB_NAME, $DB_USER, $DB_PW, $DB_SERV, $MEMCACHE_ENABLED, $MAX_DELIVERED_MESSAGES;

		// Request - Convert from array to object
		$req_str = json_encode($_GET);
		$this->request = json_decode($req_str);

		// Response
		$this->response = new inchat_response;

		// Memcache
		$this->memcache_en = $MEMCACHE_ENABLED;
		if ($MEMCACHE_ENABLED) {
			$this->memcache = new Memcached('inchat');
			$this->memcache->addServer('localhost', 11211);
		}

		// Database
		$link = mysql_pconnect($DB_SERV, $DB_USER, $DB_PW);
		if (!$link) die ("Can't connect to Database-Server: ".mysql_error());

		$this->db = mysql_select_db($DB_NAME, $link);
		if (!$link) die ("Can't change to Database: ".mysql_error());

		$this->max_delivered_messages = $MAX_DELIVERED_MESSAGES;
	}
	public function get_curr_msg_id() {
		$inchat_curr_msg_id = $this->memcache->get('current_message_id');
		return ($inchat_curr_msg_id) ? $inchat_curr_msg_id : 0;
	}
}

?>
