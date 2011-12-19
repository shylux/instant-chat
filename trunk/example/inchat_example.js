INCHAT_TARGET = "../inchat.php";
INCHAT_MAX_MESSAGES_DISPLAYED = -1;

var inchat_pane;

$(document).ready(function () {
	inchat_start();
	inchat_focus();
	inchat_pane = $('#inchat_msg_table').jScrollPane({maintainPosition: false}).data('jsp')
	inchat_pane.scrollToBottom();
});

function inchat_appendMessage(username, message, date) {
	var date_obj = Date.parse(date);
	var date_out = date_obj.toString('[hh:mm]');
	var message_template = '<p class="inchat_msg_entry">[[INCHAT_DATE]] [[INCHAT_MESSAGE]]</p>';
	var message_html = message_template.replace('[[INCHAT_DATE]]', date_out).replace('[[INCHAT_USER]]', username).replace('[[INCHAT_MESSAGE]]', message);

	var scrollbot = false;
	if (inchat_pane.getPercentScrolledY() == 100) scrollbot = true;
	inchat_pane.getContentPane().append(message_html);
	inchat_pane.reinitialise();
	inchat_pane.scrollToBottom();
}

function inchat_removeMessage() {
	//$('#inchat_msg_table div:first').remove();
}

function inchat_showError(message) {}
