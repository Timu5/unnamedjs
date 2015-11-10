/*
 * Copyright (c) 2015 Mateusz Muszyński
 * All Rights Reserved.
 */

var sLoad =
{
	init: function()
	{
		assets.queueImage('assets/wild.png');
		assets.queueImage('assets/hero.png');
		assets.queueImage('assets/cursor.png');
		//assets.queueAudio('assets/bg.ogg');
		assets.queueJSON('assets/map.json');

		assets.downloadAll( () => core.setState(sArena) );
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
	keyPress: function() { }
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
		this.sprites[0] = assets.getAsset('assets/wild.png');
		this.sprites[1] = assets.getAsset('assets/hero.png');
		this.sprites[2] = assets.getAsset('assets/cursor.png');
		this.map.data	= assets.getAsset('assets/map.json');

		this.hero = new Hero('Hero1', 20, 10);
		this.map.objects.heroes.push(this.hero); // Add our hero to map objects
	},

	update: function(time)
	{
		if(input.mouseX < 20 && this.pos[0] > 0)
		{
			this.pos[0] -= (time * 0.2);
			this.lock = false;
		}
		
		if(input.mouseX > (core.can.width - 20) && this.pos[0] < (this.map.data.width * this.map.data.tilewidth) - core.can.width - 20)
		{
			this.pos[0] += (time * 0.2);
			this.lock = false;
		}

		if(input.mouseY < 20 && this.pos[1] > 0)
		{
			this.pos[1] -= (time * 0.2);
			this.lock = false;
		}

		if(input.mouseY > (core.can.height - 20) && this.pos[1] < (this.map.data.height * this.map.data.height) - core.can.height - 20)
		{
			this.pos[1] += (time * 0.2);
			this.lock = false;
		}

		if(this.lock)
		{
			this.pos[0] = this.hero.realX - core.can.width / 2;
			this.pos[1] = this.hero.realY - core.can.height / 2;
		}

		for(var i = 0; i < this.map.objects.heroes.length; i++)
			this.map.objects.heroes[i].update(time);

		if(this.hero.status == 0 && this.path.length > this.pathptr + 1)
		{
			this.pathptr++;
			var x = this.path[this.pathptr].x - this.hero.posX;
			var y = this.path[this.pathptr].y - this.hero.posY;
			this.hero.move(x, y);
		}
	},

	draw: function()
	{
		core.ctx.clearRect(0, 0, core.can.width, core.can.height);

		var p = [this.pos[0] | 0, this.pos[1] | 0];
		this.map.drawMap(p[0], p[1]);

		if(this.path.length > 0)
			core.drawImage(this.sprites[2], 0, 60, this.path[this.path.length - 1].x * 40 - p[0], this.path[this.path.length - 1].y * 40 - p[1], 20, 20);

		this.map.drawHeroes(p[0], p[1]);
	},

	click: function()
	{
		var x = ((input.mouseX + this.pos[0]) / 40) + 0.5 | 0;
		var y = ((input.mouseY + this.pos[1]) / 40) + 0.5 | 0;

		if(this.map.data.layers[1].data[x + (y * this.map.data.height)] == 0)
		{
			var start = [this.hero.posX, this.hero.posY];
			var destination = [x, y];
			this.path = a_star(start, destination, this.map.data.layers[1].data, this.map.data.height, this.map.data.width, true);
			this.pathptr = 0;
		}
		else
		{
			this.path = [];
		}
	},

	consoleVisible: 0,

	keyPress: function(keycode)
	{
		if(keycode == 82) // "r" center camera at player coords
		{
			this.lock = true;
		}
		else if(keycode == 192) // "`" show/hide console
		{
			var cinput = $('cinput');
			if(this.consoleVisible == 0)
			{
				$('console').style.visibility = 'visible';
				cinput.focus();
				cinput.value = '';
				this.consoleVisible = 1;

				cinput.onkeyup = function(e)
				{
					if(e.keyCode == 13)
					{
						//log(cinput.value);
						eval(cinput.value);
						cinput.value = "";
					}
				};
			}
			else
			{
				$('console').style.visibility = 'hidden';
				cinput.blur();
				cinput.onkeyup = null;
				this.consoleVisible = 0;
			}
		}
		else if(keycode == 115)// F4 fullscreen on/off
		{
			core.fullscreen();
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
			var finishx = Math.min((x + core.can.width) / 40 + 1.5 | 0, this.data.width);
			var finishy = Math.min((y + core.can.height) / 40 + 1.5 | 0, this.data.height);

			var perRow = this.data.tilesets[0].imagewidth / this.data.tilewidth;
			
			for(var ix = startx; ix < finishx; ix++)
			{
				for(var iy = starty; iy < finishy; iy++)
				{
					for(var l = 0; l < 2; l++)
					{
						var tmp = this.data.layers[l].data[ix + (iy * this.data.height)] - 1;
						if(tmp >= 0)
						{
							var px = ((tmp % perRow) | 0) * this.data.tilewidth;
							var py = ((tmp / perRow) | 0) * this.data.tileheight;
							core.drawImage(sArena.sprites[0], px, py, ix * 40 - x, iy * 40 - y, 40, 40);
						}
					}
				}
			}
		},

		drawHeroes: function(x, y)
		{
			for(var i = 0; i < this.objects.heroes.length; i++)
				this.objects.heroes[i].draw(x, y + 10);
		}
	}
};
