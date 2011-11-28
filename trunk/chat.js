$(document).ready(function() {
	listening = true;
	listen();
});

maxtablelength = 7;
lastid = 0;
listening = false;
function listen() {
	$.ajax({
		url: "checkmessage.php",
		async: true,
		type: "GET",
		data: {'lastid': lastid},
		success: parseMessages,
		error: parseError
	});
}

function parseMessages(data) {
	for (var index in data) {
		var msg = data[index];
		appendMessage(msg.name, msg.message, msg.timestamp);
		lastid = msg.id;
	}
	if (listening) listen();
}

function parseError(jqXHR, textStatus, errorThrown) {
	alert(textStatus);
}

function appendMessage(username, message, date) {
	if ($('#inchat_msg_table tr').length > maxtablelength) $('#inchat_msg_table tr:first').remove();
	var date_obj = Date.parse(date);
	var date_out = date_obj.toString('[hh:mm]');
	var message_template = '<tr class="inchat_msg_entry"> <td class="inchat_msg_date">[[INCHAT_DATE]]</td> <td class="inchat_msg_message">&lt;[[INCHAT_USER]]&gt; [[INCHAT_MESSAGE]]</td> </tr>';
	var message_html = message_template.replace('[[INCHAT_DATE]]', date_out).replace('[[INCHAT_USER]]', username).replace('[[INCHAT_MESSAGE]]', message);
	$('#inchat_msg_table').append(message_html);
}

function inchat_send() {
	var username = "anonymous";
	var message = $('#inchat_input_message').val();
	
	$('#inchat_input_message').val('').focus();
	$.ajax({
		url: "addmessage.php",
		type: "POST",
		data: {'username': username, 'message': message}
	});
}

function inchat_checkenter(eventcode) {
	if (eventcode == 13) {
		$('#inchat_input_send').submit();
	}
}
