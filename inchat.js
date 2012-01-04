INCHAT_TARGET = 'inchat.php'
INCHAT_MAX_MESSAGES_DISPLAYED = 7;
INCHAT_MAX_MESSAGES_PER_SECOND = 10;

if (INCHAT_MAX_MESSAGES_DISPLAYED < 0) INCHAT_MAX_MESSAGES_DISPLAYED = Int32.MaxValue;
inchat_lastid = 0;
inchat_displayed_msg = 0;
inchat_listening = false;
inchat_listening_dev = null;
inchat_channel = "public";
inchat_channels_enc = null;
inchat_channel_info = null;
inchat_channel_pw = "";
function inchat_start() {
	inchat_listening = true;
	inchat_listen();
}
function inchat_stop() {
	inchat_lastid = 0;
	inchat_listening = false;
	inchat_listening_dev.abort();
}
function inchat_focus() {
	$('#inchat_input_message').focus();
}
function inchat_listen() {
	if (!inchat_listening) return;
	if (!inchat_register_request()) {
		inchat_showError("Server Error. Please contact the Admin.");
		return;	
	}
	inchat_listening_dev = $.ajax({
		url: INCHAT_TARGET,
		contentType: "application/json",
		dataType: "json",
		async: true,
		data: {'method': 'checknewmessage', 'params': {'lastid': inchat_lastid, 'max_messages': INCHAT_MAX_MESSAGES_DISPLAYED, 'channel': inchat_channel}, 'id': new Date().getTime()},
		success: parseMessages,
		error: parseError
	});
}

function parseMessages(data) {
	if (data.error != null) inchat_showError(data.error);
	inchat_channel_info = data.result.channelinfo;
	for (var index in data.result.messages) {
		var msg = data.result.messages[index];

		if (inchat_channel_info.enc) msg.message = inchat_decrypt(msg.message);
		inchat_appendMessage(msg.name, msg.message, msg.timestamp);
		inchat_displayed_msg++;

		if (inchat_lastid < msg.id) inchat_lastid = msg.id;

		if (inchat_displayed_msg > INCHAT_MAX_MESSAGES_DISPLAYED) {
			inchat_removeMessage();
			inchat_displayed_msg--;
		}
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
		inchat_showError(textStatus + " : " + errorThrown);
	}
}
function inchat_showError(error_string) {
	alert(error_string);
}

inchat_request_history = new Array();
function inchat_register_request() {
	var actime = new Date().getSeconds();
	if (inchat_request_history.length > INCHAT_MAX_MESSAGES_PER_SECOND) {
		if (inchat_request_history[inchat_request_history.length - INCHAT_MAX_MESSAGES_PER_SECOND] == actime) return false;
	}
	inchat_request_history.push(actime);
	return true;
}

function inchat_appendMessage(username, message, date) {
	var message_template = '<tr class="inchat_msg_entry"> <td class="inchat_msg_date">[[INCHAT_DATE]]</td> <td class="inchat_msg_message">&lt;[[INCHAT_USER]]&gt; [[INCHAT_MESSAGE]]</td> </tr>';
	var message_html = message_template.replace('[[INCHAT_DATE]]', date).replace('[[INCHAT_USER]]', username).replace('[[INCHAT_MESSAGE]]', message);
	$('#inchat_msg_table').append(message_html);
}

/*
* Called if INCHAT_MAX_MESSAGES_DISPLAYED is reached
*/
function inchat_removeMessage() {
	$('#inchat_msg_table tr:first').remove();
}

/*
* Adds a message to the stream
*/
function inchat_send() {
	var username = "anonymous";
	var message = $('#inchat_input_message').val();
	if (inchat_channels_enc[inchat_channel]) message = inchat_encrypt(message);
	
	$('#inchat_input_message').val('').focus();
	$.ajax({
		url: INCHAT_TARGET,
		contentType: "application/json",
		dataType: "json",
		data: {'method': 'addmessage', 'params': {'username': username, 'message': message, 'channel': inchat_channel}, 'id': new Date().getTime()},
		success: function(data) {
			if (data.error != null) inchat_showError(data.error);
		},
		error: parseError
	});
}

// Checks if the key pressed was the enter key
function inchat_checkenter(eventcode) {
	if (eventcode == 13) {
		inchat_send();
	}
}

/**
* Get a list of visible channels and call inchat_add_channel_to_list for every entry
*/
function inchat_list_channels() {
	$.ajax({
                url: INCHAT_TARGET,
                contentType: "application/json",
                dataType: "json",
                data: {'method': 'listchannels', 'params': {}, 'id': new Date().getTime()},
                success: function(data) {
                        if (data.error != null) inchat_showError(data.error);
			inchat_channels_enc = new Object;
			for (var i in data.result) {
				var chan = data.result[i];
				inchat_channels_enc[chan.name] = chan.enc;
				inchat_add_channel_to_list(chan.name);
			}
                },
                error: parseError
        });
}

function inchat_add_channel_to_list(chan_name) {
	
}

/*
* Cancels the actual connection and switch to specified channel
*/
function inchat_switch_channel(chan_name) {
	inchat_stop();
	inchat_channel = chan_name;
	inchat_start();
}

/*
* Request to add a channel. This action can be denied on server side.
*/
function inchat_create_channel(chan_name, encrypted, hidden) {
	$.ajax({
                url: INCHAT_TARGET,
                contentType: "application/json",
                dataType: "json",
                data: {'method': 'createchannel', 'params': {'name': chan_name, 'encrypted': encrypted, 'hidden': hidden}, 'id': new Date().getTime()},
                success: function(data) {},
                error: parseError
        });
} 

function inchat_set_pw(new_pw) {
	inchat_channel_pw = new_pw;
}

function inchat_request_pw() {

}

function inchat_encrypt(msg) {
	return AesCtr.encrypt(msg, inchat_channel_pw, 256);
}

function inchat_decrypt(msg_enc) {
	 return AesCtr.decrypt(msg_enc, inchat_channel_pw, 256);
}
