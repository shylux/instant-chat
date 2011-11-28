<?php
include_once('db_connect.php');

if (!isset($_POST['message'])) return;

$username = (isset($_POST['username'])) ? $_POST['username'] : 'anonymous';
$message = $_POST['message'];

$getuser_query = "SELECT getcreateuser('$username');";
$user_res = mysql_query($getuser_query);
if (!$user_res) die(mysql_error());
$user_array = mysql_fetch_array($user_res);
$user_id = $user_array[0];

$add_query = "SELECT addmessage($user_id, '$message');";
mysql_query($add_query);
?>
