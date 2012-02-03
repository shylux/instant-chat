$(function() {
	$('#inchat_msg_send').click(function() {
		inchat.sendMessage($('#inchat_input_message').val());
	});
	$('#inchat_create_submit').click(function() {
		inchat.createChannel($('#inchat_create_channel').val(), $('#inchat_create_enc').is(':checked'));
	});
	$('#inchat_channels').change(function() {
		$('#inchat_msg_table').html('');
		inchat.switchChannel($(this).val());
	});
	$('#inchat_channel_pw').change(function(){
		inchat.setChannelPW($(this).val());
	}); 
	inchat.displayMessage = function(username, message, date) {
		$('#inchat_msg_table').prepend("<p>"+message+"</p>");
	}
	inchat.addChannelToList = function(chan) {
		$('#inchat_channels').append('<option value="'+chan.name+'">'+chan.name+'</option>')
	}
	inchat.setInputDevice($('#inchat_input_message'));
	inchat.start();
	inchat.getChannelList();
});
