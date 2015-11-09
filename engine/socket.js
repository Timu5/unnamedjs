/*
 * Copyright (c) 2015 Mateusz Muszyñski
 * All Rights Reserved.
 */

var socket =
{
	opened: false,
	websocket: null,
	
	init: function(url)
	{
		websocket = new WebSocket(url);
		
		websocket.onopen    = function(e) { socket.opened = true; };
		websocket.onclose   = function(e) { socket.opened = false; };
		websocket.onmessage = function(e) { log("Server message: " + e.data); };
		websocket.onerror   = function(e) { socket.opened = false; };
	},
	
	send: function(data)
	{
		if(opened) socket.websocket.send(data);
	},
	
	close: function()
	{
		if(opened) socket.websocket.close();
	}
};

socket.init("ws://localhost:80/");