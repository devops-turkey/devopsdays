function show_popup(elem) {
	$('#popup-bg').css('display','block');
	$(elem).css('display','block');
}

function hide_popup(elem) {
	$(elem).css('display','none');
	$('#popup-bg').css('display','none');
}