$(document).ready(function() {
	$('#sys_navigation .sys_sec').bind('click', function() {
		site = $(this).attr('site');
		$("title").text($(this).text());
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
		$('#sys_navigation .sys_sec').each(function() {
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
	var v = viewport();

	// real height (h + padding + border + margin) - content height of navigation bar
	var mbp = navi.outerHeight(true)-navi.height();
	$('#sys_frame').height(v['height']);
	navi.height(v['height'] - mbp);

	var offset = 1;
	if ($(document).height() > v["height"]) {
		offset = 20;
		setTimeout("resize();", 50);
	}
	$('#sys_frame').width( v['width'] - navi.outerWidth(true)-offset);
}
window.onresize = resize;

function viewport() {
	var e = window
	, a = 'inner';
	if ( !( 'innerWidth' in window ) ) {
		a = 'client';
		e = document.documentElement || document.body;
	}
	return { width : e[ a+'Width' ] , height : e[ a+'Height' ] }
}
