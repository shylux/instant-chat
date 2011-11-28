<?php
include_once('db_connect.php');

$lastid = (isset($_GET['lastid'])) ? $_GET['lastid'] : 0;

while (count_new_messages($lastid) == 0) {
	sleep(0.1);
}

$query_string = "SELECT message.*, user.name FROM message, user WHERE message.user = user.id AND message.id > $lastid;";
$result = mysql_query($query_string);

$result_array = array();
while ($row=mysql_fetch_object($result)) {
	$row->message = htmlspecialchars($row->message);
	array_push($result_array, $row);
}

header('Content-type: application/json');

echo json_encode($result_array);

function count_new_messages($index) {
	$query = mysql_query("SELECT checknewmessages($index)");
	$re_array = mysql_fetch_array($query);
	return $re_array[0];
}

?>
