function InChatO() {
	// The URL to connect
	this.target = 'inchat.php';
	this.max_messages_per_second = 10;
	//Timestamps (seconds) of the last requests to detect server-side errors
	this.request_history = new Array();

	this.lastid = 0;
	this.listening = false;
	this.listening_dev = null;

	//the text input field for the message
	this.input_dev = null;

	this.channel_name = "public";
	this.channel_enc = null;
	this.channel_info = null;
	this.channel_pw = "";

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
	start: function() {},
	//stops listening
	stop: function() {},
	//focuses the input box
	focus: function() {},
	//called if an error occured
	error: function(error_message) {},

	//called if a new message appears
	displayMessage: function(username, message, date) {},
	//sends a message to server
	sendMessage: function(message) {},

	getChannelList: function() {},
	switch_channel: function(chan_name) {},
	create_channel: function() {},

	//sets the input field for the message
	setInputDevice: function(jqobj) {},


	/* Intern Functions */

	//Called from JQuery AJAX. Checks cause.
	detectRequestError: function() {},
	//Logs the request in request_history
	logRequest: function() {},

	//encryption !! needs aes.js
	encrypt: function(msg) {
		return AesCtr.encrypt(msg, this.channel_pw, 256);
	},
	decrypt: function(msg_enc) {
		return AesCtr.decrypt(msg_enc, this.channel_pw, 256);
	}

}

var inchat = new InChatO();

alert(inchat.target);
