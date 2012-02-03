function InChatO() {
	// The URL to connect
	this.target = 'inchat2.php';
	this.max_messages_per_second = 10;
	//Timestamps (seconds) of the last requests to detect server-side errors
	this.request_history = new Array();

	this.lastid = 0;
	this.listening = false;
	this.listening_dev = null;

	//the text input field for the message
	this.input_dev = null;

	this.channel_name = "public";
	this.channel_enc = false;
	this.channel_pw = "";
	this.channels_info = null;

	// !! only set this to true if you included aes.js
	this.encryption_enabled = false;

	this.init();
}
InChatO.prototype = {
	//Checks the parameters
	init: function() {
		if (this.max_messages_displayed < 1) this.max_messages_displayed = Int32.MaxValue;
	},
	//starts listening
	start: function() {
		this.listening = true;
		this.listen();
	},
	//stops listening
	stop: function() {
		this.lastid = 0;
		this.listening = false;
		this.listening_dev.abort();
	},
	//focuses the input box
	focus: function() {
		if (this.input_dev != null) this.input_dev.focus();
	},
	//called if an error occured
	error: function(error_message) {
		alert(error_message);
	},

	//called if a new message appears
	displayMessage: function(username, message, date) {},
	//sends a message to server
	sendMessage: function(message) {
		if (this.channel_enc) message = this.encrypt(message);
		if (this.input_dev != null) this.input_dev.val('').focus();
		$.ajax({
			url: this.target,
			contentType: "application/json",
			dataType: "json",
			data: {
				'id': new Date().getTime(),
				'method': 'addmessage',
				'params': {
					'message': message,
					'channel': this.channel_name
				}
			},
			success: function(data) {
				if (data.error != null) inchat.error(data.error);
			},
			error: this.detectRequestError
		});
	},

	getChannelList: function() {
		$.ajax({
			url: this.target,
			contentType: "application/json",
			dataType: "json",
			data: {
				'id': new Date().getTime(),
				'method': 'listchannels',
				'params': {}
			},
			success: function(data) {
				if (data.error != null) {
					inchat.error(data.error);
					return;
				}
				for (var i in data.result) {
					inchat.addChannelToList(data.result[i]);
				}
			},
			error: this.detectRequestError
		});
	},
	addChannelToList: function(chan) {},
	switchChannel: function(chan_name) {
		this.stop();
		this.channel_name = chan_name;
		this.start();
	},
	setChannelPW: function(pw) {
		this.channel_pw = pw;
	},
	createChannel: function(chan_name, encrypted, hidden) {
		if (hidden === undefined) hidden = false;
		if (encrypted === undefined) encrypted = false;
		$.ajax({
			url: this.target,
			contentType: "application/json",
			dataType: "json",
			data: {
				'id': new Date().getTime(),
				'method': 'createchannel',
				'params': {
					'name': chan_name,
					'encrypted': encrypted,
					'hidden': hidden
				}
			},
			error: this.detectRequestError
		});
	},

	//sets the input field for the message
	setInputDevice: function(jqobj) {
		this.input_dev = jqobj;
		this.input_dev.keydown(function(event) {
			if (event.keyCode == '13') inchat.sendMessage($(this).val());
		});
	},


	/* Intern Functions */

	//waiting for new message
	listen: function() {
		if (!this.listening || !this.logRequest()) return;
		this.listening_dev = $.ajax({
			url: this.target,
			contentType: "application/json",
			dataType: "json",
			async: true,
			data: {
				'id': new Date().getTime(),
				'method': 'checknewmessage',
				'params': {
					'lastid': this.lastid,
					'channel': this.channel_name
				},
			},
			success: this.detectExpectedError,
			error: this.detectRequestError
		});
	},
	//Called from JQuery AJAX. Checks cause.
	detectRequestError: function() {},
	//check if a expected error occured (with a valid json syntax)
	detectExpectedError: function(data) {
		if (data.error != null) {
			inchat.error(data.error);
			return;
		}
		inchat.channel_enc = data.result.channelinfo.enc;
		for (var i in data.result.messages) {
			var msg = data.result.messages[i];
			if (inchat.channel_enc) msg.message = inchat.decrypt(msg.message);
			inchat.displayMessage(msg.name, msg.message, msg.timestamp);
			if (inchat.lastid < msg.id) inchat.lastid = msg.id;
		}
		inchat.listen();
	},
	//Logs the request in request_history
	logRequest: function() {
		if (this.request_history.length > this.max_messages_per_second && this.request_history[this.request_history.length - this.max_messages_per_second] == new Date().getSeconds()) return false;
		this.request_history.push(new Date().getSeconds());
		return true; 
	},

	//encryption !! needs aes.js
	encrypt: function(msg) {
		return AesCtr.encrypt(msg, this.channel_pw, 256);
	},
	decrypt: function(msg_enc) {
		return AesCtr.decrypt(msg_enc, this.channel_pw, 256);
	}

}

// dont change the object name
var inchat = new InChatO();
