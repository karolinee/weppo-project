(function () {
    var socket = io();

    $('new').on('click', function() {
	var name='name';
	var name = JSON.parse($('#nick').text());
	$('#variableJSON').remove();
	socket.emit('createRoom', {name:name});
    });
})();
