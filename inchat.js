var INCHAT_TARGET = 'inchat.php'

$(document).ready(function() {
	listening = true;
	inchat_listen();
	$('#inchat_input_message').focus();
});

MAX_MESSAGES_DISPLAYED = 7;
maxtablelength = MAX_MESSAGES_DISPLAYED;
lastid = 0;
listening = false;
function inchat_listen() {
	if (!listening) return;
	$.ajax({
		url: INCHAT_TARGET,
		contentType: "application/json",
		dataType: "json",
		async: true,
		data: {'action': 'checknewmessage', 'lastid': lastid, 'max_messages': MAX_MESSAGES_DISPLAYED},
		success: parseMessages,
		error: parseError,
	});
}

function parseMessages(data) {
	if (data.status != 'success') alert(data.message);
	for (var index in data.messages) {
		var msg = data.messages[index];
		appendMessage(msg.name, msg.message, msg.timestamp);
		if (lastid < msg.id) lastid = msg.id;
	}
	inchat_listen();
}

function parseError(jqXHR, textStatus, errorThrown) {
	if (textStatus == "parsererror" && jqXHR.status == 200) {
		// Just a workaround for server timeout
		inchat_listen();
	} else if (jqXHR.status == 0 && jqXHR.readyState == 0) {
		// request aborted
		return;		
	} else {
		alert(JSON.stringify(jqXHR) + " : " + textStatus + " : " + errorThrown);
	}
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
		url: INCHAT_TARGET,
		contentType: "application/json",
		dataType: "json",
		data: {'action': 'addmessage', 'username': username, 'message': message}
	});
}

function inchat_checkenter(eventcode) {
	if (eventcode == 13) {
		$('#inchat_input_send').submit();
	}
}