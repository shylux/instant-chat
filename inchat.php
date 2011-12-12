<?php
include_once('inchat_db.php');

// Use Memcache for better performance!
define('INCHAT_MEMCACHE_ENABLED', false);

define('INCHAT_DB_TYPE', 'mysql');
define('INCHAT_DB_NAME', 'instantchat');
define('INCHAT_DB_USER', 'instantchatuser');
define('INCHAT_DB_PW', 'instantpwchat');
define('INCHAT_DB_HOST', 'localhost');

define('INCHAT_SLEEP_DB', 10);
define('INCHAT_SLEEP_MEMCACHED', 5);

define('INCHAT_MAX_DELIVERED_MESSAGES', 30);

$ic = Inchat::getInstance();

if (!inchat_authenticate()) {
	$ic->response->send_error("Authentication failed.");
}

// Check vor valid action
if (!isset($ic->request->method)) die("No action set");

// Handle different actions
switch ($ic->request->method) {
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
	if (!isset($ic->request->params->message)) {
		$ic->response->send_error("No Message specified.");
	}

	$username = inchat_getusername();
	$message = $ic->request->params->message;

	$user_id = $ic->db->getUser($username);

	$ic->db->addMessage($user_id, $message);
	if (INCHAT_MEMCACHE_ENABLED) $ic->memcache->set('current_message_id', $message_id);
}

function checknewmessage() {
	$ic = Inchat::getInstance();
	$lastid = (isset($ic->request->params->lastid)) ? $ic->request->params->lastid : 0;

	if (INCHAT_MEMCACHE_ENABLED) {
		wait_for_message_memcache();
	} else {
		wait_for_message_db();
	}

	$limit = (INCHAT_MAX_DELIVERED_MESSAGES < $ic->request->params->max_messages) ? INCHAT_MAX_DELIVERED_MESSAGES : $ic->request->params->max_messages;

	$result_array = $ic->db->getMessages($lastid, $limit); 

	$ic->response->result = $result_array;
}
function wait_for_message_db() {
	$ic = Inchat::getInstance();
	while (!$ic->db->isNewMsg($ic->request->params->lastid)) {
		usleep(10000 * INCHAT_SLEEP_DB);
	}
}
function wait_for_message_memcache() {
	$ic = Inchat::getInstance();
	while ($ic->get_curr_msg_id() == $ic->request->params->lastid) {
		usleep(10000 * INCHAT_SLEEP_MEMCACHED);
	}
}
	
class inchat_response {
	public $result = 'success';
	public $error = null;
	public $id;
	public function respond() {
		header('Content-type: application/json');
		echo json_encode($this);
		die();
	}
	public function send_success($message) {
		$this->result = $message;
		$this->error = null;
		$this->respond();
	}
	public function send_error($errorstring) {
		$this->result = null;
		$this->error = $errorstring;
		$this->respond();
	}
}

class Inchat {
	public $memcache;
	public $db;
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
		// Request - Convert from array to object
		$req_str = json_encode($_GET);
		$this->request = json_decode($req_str);

		// Response
		$this->response = new inchat_response;
		$this->response->id = $this->request->id;

		// Memcache
		if (INCHAT_MEMCACHE_ENABLED) {
			$this->memcache = new Memcached('inchat');
			$this->memcache->addServer('localhost', 11211);
		}
		
		// Database
		$this->db = Inchat_db::getInstance();
		$this->db->setup(INCHAT_DB_TYPE, INCHAT_DB_HOST, INCHAT_DB_NAME, INCHAT_DB_USER, INCHAT_DB_PW);
	}
	public function get_curr_msg_id() {
		$inchat_curr_msg_id = $this->memcache->get('current_message_id');
		return ($inchat_curr_msg_id) ? $inchat_curr_msg_id : 0;
	}
}

?>
