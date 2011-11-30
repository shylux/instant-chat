<?php
inchat_db_connect();

$inchat_memcache = new Memcached('inchat');
$inchat_memcache->addServer('localhost', 11211);

$inchat_curr_msg_id = $inchat_memcache->get('current_message_id');

// Convert from array to object
$req_str = json_encode($_GET);
$request = json_decode($req_str);

// Check vor valid action
if (!isset($request->action)) die("No action set");

$resp = new inchat_response;

// Handle different actions
switch ($request->action) {
	case "addmessage":
		addmessage();
		break;
	case "checknewmessage":
		checknewmessage();
		break;
	default:
		$resp->send_error('No action defined.');
}

$resp->respond();


function addmessage() {
	global $request, $resp, $inchat_memcache;
	if (!isset($request->message)) {
		$resp->send_error("No Message specified.");
	}

	$username = (isset($request->username)) ? $request->username : 'anonymous';
	$message = $request->message;

	$getuser_query = "SELECT getcreateuser('".mysql_escape_string($username)."');";
	$user_res = inchat_mysql_query($getuser_query);
	$user_array = mysql_fetch_array($user_res);
	$user_id = $user_array[0];

	$add_query = "SELECT addmessage($user_id, '".mysql_escape_string($message)."');";
	$message_id_res = inchat_mysql_query($add_query);
	$message_id_array = mysql_fetch_array($message_id_res);
	$message_id = $message_id_array[0];
	$inchat_memcache->set('current_message_id', $message_id);
}

function checknewmessage() {
	global $request, $resp, $inchat_memcache;
	$lastid = (isset($request->lastid)) ? $request->lastid : 0;

	/*
	while (count_new_messages($lastid) == 0) {
		sleep(0.1);
	}
	*/
	while ($inchat_memcache->get('current_message_id') == $lastid) {
		usleep(50000);
	}

	$query_string = "SELECT message.*, user.name FROM message, user WHERE message.user = user.id AND message.id > ".mysql_escape_string($lastid).";";
	$result = inchat_mysql_query($query_string);

	$result_array = array();
	while ($row=mysql_fetch_object($result)) {
		$row->message = htmlspecialchars($row->message);
		array_push($result_array, $row);
	}

	$resp->messages = $result_array;
}
	
function count_new_messages($index) {
	$query = inchat_mysql_query("SELECT checknewmessages('".mysql_escape_string($index)."')");
	$re_array = mysql_fetch_array($query);
	return $re_array[0];
}

function inchat_mysql_query($query) {
	global $resp;
	$recource = mysql_query($query);
	if (!$recource) {
		$resp->send_error("MySQL Error: ".mysql_error()."\nQuery: ".$query);
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
?>
