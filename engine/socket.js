/*
 * Copyright (c) 2015 Mateusz Muszyński
 * All Rights Reserved.
 */

var socket =
{
	opened: false,
	websocket: null,
	
	init: function(url)
	{
		socket.websocket = new WebSocket(url);
		
		socket.websocket.onopen    = function(e) { socket.opened = true; };
		socket.websocket.onclose   = function(e) { socket.opened = false; };
		socket.websocket.onmessage = function(e) { core.state.message(e); };
		socket.websocket.onerror   = function(e) { socket.opened = false; };
	},
	
	send: function(data)
	{
		if(socket.opened) socket.websocket.send(data);
	},
	
	close: function()
	{
		if(socket.opened) socket.websocket.close();
	}
};
