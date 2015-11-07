/*
 * Copyright (c) 2015 Mateusz Muszyński
 * All Rights Reserved.
 */

var debug = true;

function $(id) { return document.getElementById(id); }

function log(text)
{
	$('log').innerHTML += '[' + (new Date()).toTimeString().substr(0, 8) + '] ' + text + '<br>';
	$('log').scrollTop = $('log').scrollHeight;
}

function error(text)
{
	log('<font color="red">Error: ' + text + '</font>');
}

window.onerror = function(msg, url, line)
{
	error(msg + ' url: ' + url + ' line: ' + line);
	return false;
}

var core =
{
	can: 0, // Canvas element
	ctx: 0, // Canvas context element

	state: sLoad, // Current state

	start: function()
	{
		core.can = $('canvas');
		core.ctx = core.can.getContext('2d');

		core.resize();
		window.addEventListener('resize', core.resize, false);

		core.state.init();

		requestAnimationFrame(core.tick);
	},

	setState: function(newState)
	{
		core.state = newState;
		core.state.init();
	},

	oldTime: 0,

	frames: 0,
	fps: 0,
	counter: 20,

	tick: function(time)
	{
		var newtime = time - core.oldTime;
		core.oldTime = time;
		core.state.update(newtime);
		core.state.draw();
		if(debug)
		{
			// this code draw fps counter
			core.counter++;
			core.frames += (1 / newtime * 1000);
			if(core.counter > 20)
			{
				core.fps = (core.frames / core.counter) | 0;
				core.frames = 0;
				core.counter = 0;
			}
			core.ctx.font = '20pt Calibri';
			core.ctx.fillStyle = 'white';
			core.ctx.fillText(core.fps.toString(), 00, 20);
			core.ctx.strokeText(core.fps.toString(), 00, 20);
		}
		requestAnimationFrame(core.tick);
	},

	resize: function()
	{
		core.can.width = window.innerWidth;
		core.can.height = window.innerHeight;
	},

	fullscreen: function()
	{
		var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
		if(fullscreenElement == document.documentElement)
		{
			if(document.exitFullscreen)            document.exitFullscreen();
			else if(document.mozCancelFullScreen)  document.mozCancelFullScreen();
			else if(document.webkitExitFullscreen) document.webkitExitFullscreen();
		}
		else
		{
			var element = document.documentElement;
			if(element.requestFullscreen)            element.requestFullscreen();
			else if(element.mozRequestFullScreen)    element.mozRequestFullScreen();
			else if(element.webkitRequestFullscreen) element.webkitRequestFullscreen();
		}
	},

	drawImage: function(src, srcx, srcy, desx, desy, w, h)
	{
		if(srcx >= 0 && srcy >= 0 && w >= 0 && h >= 0)
			core.ctx.drawImage(src, srcx, srcy, w, h, desx - (w / 2), desy - (h / 2), w, h);
		else
			log("U should fix it!");
	}
}

core.start();
input.init();
