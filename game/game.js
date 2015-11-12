/*
 * Copyright (c) 2015 Mateusz Muszyński
 * All Rights Reserved.
 */

var sLoad =
{
	init: function()
	{
		$('UI').innerHTML = '';

		assets.queueImage('assets/wild.png');
		assets.queueImage('assets/hero.png');
		assets.queueImage('assets/cursor.png');
		//assets.queueAudio('assets/bg.ogg');
		assets.queueUI('ui/arena.html');
		assets.queueUI('ui/login.html');
		assets.queueJSON('assets/map.json');

		assets.downloadAll( () => core.setState(sLogin) );
	},

	update: function(time) { },

	draw: function()
	{
		var width = 200;
		var height = 50;
		var tx = (core.can.width - width) / 2 | 0;
		var ty = (core.can.height - height) / 2 | 0;
		var val = (assets.successCount + assets.errorCount) / assets.downloadQueue.length;
		
		core.ctx.clearRect(0, 0, core.can.width, core.can.height);
		
		core.ctx.fillStyle = '#777';
		core.ctx.fillRect(tx, ty, width, height);
		
		core.ctx.fillStyle = '#0F0';
		core.ctx.fillRect(tx, ty, width * val, height);
	},

	click: function() { },
	keyPress: function() { },
	message: function() { }
}

var sLogin =
{
	init: function()
	{
		$('UI').innerHTML = assets.getAsset('ui/login.html');
		$('buttonLogin').onclick = () => socket.send('/login ' + $('usermail').value + ' ' + $('password').value);
		
		socket.init("ws://localhost:80/");
	},

	update: function(time) { },

	draw: function()
	{
		core.ctx.clearRect(0, 0, core.can.width, core.can.height);
	},

	click: function() { },
	keyPress: function() { },
	message: function(e)
	{
		if(e.data == '/OK') core.setState(sArena);
	}
}

var sArena =
{
	sprites: [],
	hero: 0,
	path: [],
	pathptr: 0,
	pos: [0, 0], // Camera position
	lock: true, // Camera locked on player

	init: function()
	{
		sArena.sprites[0] = assets.getAsset('assets/wild.png');
		sArena.sprites[1] = assets.getAsset('assets/hero.png');
		sArena.sprites[2] = assets.getAsset('assets/cursor.png');
		sArena.map.data	  = assets.getAsset('assets/map.json');
		$('UI').innerHTML = assets.getAsset('ui/arena.html');

		sArena.hero = new Hero('Hero1', 20, 20);
		sArena.map.objects.heroes.push(sArena.hero); // Add our hero to map objects
	},

	update: function(time)
	{
		if(sArena.lock)
		{
			sArena.pos[0] = sArena.hero.realX - core.can.width / 2;
			sArena.pos[1] = sArena.hero.realY - core.can.height / 2;
		}
		else
		{
			if(input.mouseX < 20 && sArena.pos[0] > - core.can.width / 2)
			{
				sArena.pos[0] -= (time * 0.2);
				sArena.lock = false;
			}
			else if(input.mouseX > (core.can.width - 20) && sArena.pos[0] < (sArena.map.data['width'] * sArena.map.data['tilewidth']) - core.can.width / 2)
			{
				sArena.pos[0] += (time * 0.2);
				sArena.lock = false;
			}
			else if(input.mouseY < 20 && sArena.pos[1] > - core.can.height / 2)
			{
				sArena.pos[1] -= (time * 0.2);
				sArena.lock = false;
			}
			else if(input.mouseY > (core.can.height - 20) && sArena.pos[1] < (sArena.map.data['height'] * sArena.map.data['tileheight']) - core.can.height / 2)
			{
				sArena.pos[1] += (time * 0.2);
				sArena.lock = false;
			}
		}

		for(var i = 0; i < sArena.map.objects.heroes.length; i++)
			sArena.map.objects.heroes[i].update(time);

		if(sArena.hero.status == 0 && sArena.path.length > sArena.pathptr + 1)
		{
			sArena.pathptr++;
			var x = sArena.path[sArena.pathptr].x - sArena.hero.posX;
			var y = sArena.path[sArena.pathptr].y - sArena.hero.posY;
			sArena.hero.move(x, y);
			socket.send("/move " + sArena.path[sArena.pathptr].x + " " + sArena.path[sArena.pathptr].y);
		}
	},

	draw: function()
	{
		core.ctx.clearRect(0, 0, core.can.width, core.can.height);

		var p = [sArena.pos[0] | 0, sArena.pos[1] | 0];
		sArena.map.drawMap(p[0], p[1]);

		if(sArena.path.length > 0)
			core.drawImage(sArena.sprites[2], 0, 60, sArena.path[sArena.path.length - 1].x * 40 - p[0], sArena.path[sArena.path.length - 1].y * 40 - p[1], 20, 20);

		sArena.map.drawHeroes(p[0], p[1]);
	},

	click: function()
	{
		var x = ((input.mouseX + sArena.pos[0]) / 40) + 0.5 | 0;
		var y = ((input.mouseY + sArena.pos[1]) / 40) + 0.5 | 0;

		if(sArena.map.data['layers'][1]['data'][x + (y * sArena.map.data['height'])] == 0)
		{
			var start = [sArena.hero.posX, sArena.hero.posY];
			var destination = [x, y];
			sArena.path = a_star(start, destination, sArena.map.data['layers'][1]['data'], sArena.map.data['height'], sArena.map.data['width'], true);
			sArena.pathptr = 0;
		}
		else
		{
			sArena.path = [];
		}
	},

	consoleVisible: 0,

	keyPress: function(keycode)
	{
		switch(keycode)
		{
			case 13: // ENTER
				if(document.activeElement.id == 'chatInput')
				{
					socket.send(document.activeElement.value);
					document.activeElement.value = '';
				}
				else if(document.activeElement.id == 'cinput')
				{
					eval(document.activeElement.value);
					document.activeElement.value = "";
				}
				break;
			case 82: // "r" center camera at player coords
				sArena.lock = !sArena.lock;
				break;
			case 192: // "`" show/hide console
				var cinput = $('cinput');
				if(sArena.consoleVisible == 0)
				{
					$('console').style.visibility = 'visible';
					cinput.focus();
					cinput.value = '';
					sArena.consoleVisible = 1;
				}
				else
				{
					$('console').style.visibility = 'hidden';
					cinput.blur();
					sArena.consoleVisible = 0;
				}
				break;
			case 115: // F4 fullscreen on/off
				core.fullscreen();
				break;
			case 67: // "c" switch to chat
				$('chatInput').focus();
				break;
		}
	},

	message: function(e)
	{
		if(e.data.startsWith('/'))
		{
			var args = e.data.split(' ');
			switch(args[0])
			{
				case '/new':
					sArena.map.objects.heroes.push(new Hero(args[1], parseInt(args[2]), parseInt(args[3])));
					break;
				case '/move':
					var h = sArena.map.objects.heroes.filter(function(obj) { return obj.name == args[1]; })[0];
					if(h == undefined)
						sArena.map.objects.heroes.push(new Hero(args[1], parseInt(args[2]), parseInt(args[3])));
					else
						h.move(parseInt(args[2]) - h.posX, parseInt(args[3]) - h.posY);
					break;
			}
		}
		else
		{
			$('chat').innerHTML += e.data + '<br />';
		}
	},

	map:
	{
		data: 0,
		objects: { heroes:[] },

		drawMap: function(x, y)
		{
			var startx  = Math.max((x / 40 - 0.5) | 0, 0);
			var starty  = Math.max((y / 40 - 0.5) | 0, 0);
			var finishx = Math.min((x + core.can.width) / 40 + 1.5 | 0, sArena.map.data['width']);
			var finishy = Math.min((y + core.can.height) / 40 + 1.5 | 0, sArena.map.data['height']);

			var perRow = sArena.map.data['tilesets'][0]['imagewidth'] / sArena.map.data['tilewidth'];
			
			for(var ix = startx; ix < finishx; ix++)
			{
				for(var iy = starty; iy < finishy; iy++)
				{
					for(var l = 0; l < 2; l++)
					{
						var tmp = sArena.map.data['layers'][l]['data'][ix + (iy * sArena.map.data['height'])] - 1;
						if(tmp >= 0)
						{
							var px = ((tmp % perRow) | 0) * sArena.map.data['tilewidth'];
							var py = ((tmp / perRow) | 0) * sArena.map.data['tileheight'];
							core.drawImage(sArena.sprites[0], px, py, ix * 40 - x, iy * 40 - y, 40, 40);
						}
					}
				}
			}
		},

		drawHeroes: function(x, y)
		{
			for(var i = 0; i < sArena.map.objects.heroes.length; i++)
				sArena.map.objects.heroes[i].draw(x, y + 10);
		}
	}
};
