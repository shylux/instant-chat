$(document).ready(function() {
	$('#sys_navigation .sys_sec').bind('click', function() {
		site = $(this).attr('site');
		$(location).attr("hash", site);
		$('#sys_frame').attr('src', site);

		$('.sys_selected').addClass('sys_unselected');
		$('.sys_selected').removeClass('sys_selected');
		$(this).removeClass('sys_unselected');
		$(this).addClass('sys_selected');
	});
	$('#sys_navigation .sys_sec').addClass('sys_unselected');
	var hash = $(location).attr("hash").substr(1);
	if (hash != "") {
		$('#sys_navigation div').each(function() {
			if ($(this).attr('site') == hash) $(this).click();
		});
	} else {
		$('#sys_navigation div:first').click();
	}
	$('#sys_navigation .sys_sec').hover(function() {$(this).addClass('sys_hoverindiefresse')},function() {$(this).removeClass('sys_hoverindiefresse')});
	resize();
});
function resize() {
	var doc = $(document);
	var navi = $('#sys_navigation');
	navi.height( doc.height() - (navi.outerHeight(true)-navi.height()) );
	$('#sys_frame').width( doc.width() - navi.outerWidth(true) -30 );
	$('#sys_frame').height( doc.height() - 20);
}
window.onresize = resize;
