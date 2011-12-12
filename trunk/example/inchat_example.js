INCHAT_TARGET = "../inchat.php";
INCHAT_MAX_MESSAGES_DISPLAYED = 5;

$(document).ready(function () {
	inchat_start();
	inchat_focus();
});

function inchat_appendMessage(username, message, date) {
	var date_obj = Date.parse(date);
	var date_out = date_obj.toString('[hh:mm]');
	var message_template = '<tr class="inchat_msg_entry"> <td class="inchat_msg_date">[[INCHAT_DATE]]</td> <td class="inchat_msg_message">[[INCHAT_MESSAGE]]</td> </tr>';
	var message_html = message_template.replace('[[INCHAT_DATE]]', date_out).replace('[[INCHAT_USER]]', username).replace('[[INCHAT_MESSAGE]]', message);
	$('#inchat_msg_table').append(message_html);
}

function inchat_removeMessage() {
	$('#inchat_msg_table tr:first').remove();
}

function inchat_showError(message) {}
