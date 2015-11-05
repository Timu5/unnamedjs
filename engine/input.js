/*
 * Copyright (c) 2015 Mateusz Muszyński
 * All Rights Reserved.
 */

var input = 
{
	mouseX: 0,
	mouseY: 0,
	
	mouseState:  0,//0-mouseup, 1-mousedown
	mouseButton: 0,//0-nothing, 1-left, 2-right, 3-left+right
	mouseWheel:  0,
	
	keys: [],
	//DPad: { left: 0, right: 0, up: 0, down: 0 },
	
	init: function()
	{
		core.can.addEventListener('mousemove', input.mousePosCallback,  false);
		core.can.addEventListener('mousedown', input.mouseDownCallback, false);
		core.can.addEventListener('mouseup',   input.mouseUpCallback,   false);
		window.addEventListener  ('keydown',   input.keyDownCallback,   true);
		window.addEventListener  ('keyup',     input.keyUpCallback,     true);
		
		//prevent context menu
		document.addEventListener('contextmenu', e => e.preventDefault(), false);
	},
	
	mousePosCallback:	function(e) { input.mouseX = e.pageX - core.can.offsetLeft; input.mouseY = e.pageY - core.can.offsetTop; },
	mouseDownCallback:	function(e) { input.mouseState = 1; },
	mouseUpCallback:	function(e) { core.state.click(); input.mouseState = 0; },
	mouseWheelCallback:	function(e) { input.mouseWheel = 0; },
	keyUpCallback:		function(e) { core.state.keyPress(e.keyCode); input.keys[e.keyCode] = 0; },
	keyDownCallback:	function(e)
	{
		if(input.keys[e.keyCode] != 1)
		{
			input.keys[e.keyCode] = 1;
			if(debug) $("keyInd").innerHTML = e.keyCode;
		}
	}
}