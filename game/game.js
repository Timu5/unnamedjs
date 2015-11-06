/*
 * Copyright (c) 2015 Mateusz Muszyński
 * All Rights Reserved.
 */
 
var sLoad = 
{
	init: function()
	{
		assets.queueImage('assets/background.png');
		assets.queueImage('assets/hero.png');
		assets.queueImage('assets/cursor.png');
		assets.queueAudio('assets/bg.ogg');
		assets.queueJSON('assets/map.json');

		assets.downloadAll( () => core.setState(sArena) );
	},
	
	update: function(time) { },
	
	draw: function() //TODO Add some nice looking loading bar
	{
		/*core.ctx.font = '40pt Calibri';
		core.ctx.fillStyle = 'blue';
		core.ctx.fillText('Loading!', 140, 100);*/
	}
}

var sArena =
{
	sprites: [],
	hero: 0,
	path: [],
	pathptr: 0,
	pos: [0,0],
	last: [0,0],
	
	init: function()
	{
		this.sprites[0] = assets.getAsset('assets/background.png');
		this.sprites[1] = assets.getAsset('assets/hero.png');
		this.sprites[2] = assets.getAsset('assets/cursor.png');
		this.map.data	= assets.getAsset("assets/map.json");

		//assets.getAsset("bg.ogg").play();
		
		this.hero = new hero("Hero1", 13, 10);
		this.map.objects.heroes.push(this.hero);
		//this.map.objects.heroes.push(new hero("Hero2", 15, 12));
		//this.map.objects.heroes.push(new hero("Hero3", 18, 14));
	},
	
	update: function(time)
	{
		if(input.mouseX < 20 && this.pos[0] > 0)
			this.pos[0] -= (time * 0.2);
		if(input.mouseX > core.can.width-20 && this.pos[0] < 64*32 - core.can.width-20)
			this.pos[0] += (time * 0.2);
			
		if(input.mouseY < 20 && this.pos[1] > 0)
			this.pos[1] -= (time * 0.2);
		if(input.mouseY > core.can.height-20 && this.pos[1] < 64*32 - core.can.height-20)
			this.pos[1] += (time * 0.2);
		
		if(this.inMove == 1)	
		{
			var x = this.path[this.pathptr + 1].x - this.hero.posX;
			var y = this.path[this.pathptr + 1].y - this.hero.posY;
			//log(x+" "+y);
			this.move(x, y, time);
		}
		
		for(var i = 0; i < this.map.objects.heroes.length; i++)
			this.map.objects.heroes[i].update(time);
		
	},
	
	draw: function()
	{
		core.ctx.clearRect(0, 0, core.can.width, core.can.height);
		var p = [this.pos[0]|0, this.pos[1]|0];
		this.map.drawMap(p[0], p[1]);
		
		if(this.path.length > 0)
			core.drawImage(this.sprites[2], 0, 60, this.path[this.path.length - 1].x * 32- p[0], this.path[this.path.length - 1].y * 32 - p[1], 20,20);
		
		this.map.drawHeroes(p[0], p[1]);
		core.ctx.drawImage(this.sprites[2], 0, 0, 20, 20, input.mouseX, input.mouseY, 20,20);
	},
	
	click: function()
	{
		if(this.inMove != 1)
		{
			var x = ((input.mouseX + this.pos[0]) / 32) + 0.5 |0;
			var y = ((input.mouseY + this.pos[1]) / 32) + 0.5 |0;

			if(this.map.data.layers[2].data[x + (y * this.map.data.height)] == 0)
			{
				var start = [this.hero.posX, this.hero.posY];
				var destination = [x, y];
				this.path = a_star(start, destination, this.map.data.layers[2].data, this.map.data.height, this.map.data.width, true);
			
				this.last[0] = x;
				this.last[1] = y;
				this.inMove = 1;
				this.hero.status = 1;
			}
			else
			{
				this.path = [];
			}
		}
	},
	
	consoleVisible: 0,
	
	keyPress: function(keycode)
	{
		if(keycode == 82) // "r" center camera at player coords
		{
			this.pos[0] = this.hero.realX - core.can.width / 2;
			this.pos[1] = this.hero.realY - core.can.height / 2;
		}
		else if(keycode == 192) // "`" show/hide console
		{
			var cinput = $("cinput");
			if(this.consoleVisible == 0)
			{
				$("console").style.visibility = "visible";
				cinput.focus();
				cinput.value = "";
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
				$("console").style.visibility = "hidden";
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
	
	inMove: 0,
	cnt: 0,
	
	move: function(x, y, time)
	{
		time *= 0.1;
		this.inMove = 1;
		this.hero.realX += x * time;
		this.hero.realY += y * time;
		
		if(this.cnt == 0)
			this.hero.rotate(x, y);
		
		this.cnt += 1 * time;
		
		if(this.cnt >= 32)
		{
			this.hero.posX = this.hero.realX / 32 | 0;
			this.hero.posY = this.hero.realY / 32 | 0;
			if(x < 0) this.hero.posX++;
			if(y < 0) this.hero.posY++;
	
			this.hero.realX = this.hero.posX * 32;
			this.hero.realY = this.hero.posY * 32;
			this.pathptr++;
			this.cnt = 0;
		}
		if(this.pathptr >= this.path.length - 1)
		{
			this.path = [];
			this.pathptr = 0;
			this.inMove = 0;
			this.hero.status = 0;
		}
	},
	
	map: 
	{
		data: 0,
		objects: { heroes:[] },

		drawMap: function(x, y)
		{
			var startx  = Math.max((x / 32 - 0.5) | 0, 0);
			var starty  = Math.max((y / 32 - 0.5) | 0, 0);
			var finishx = Math.min((x + core.can.width) / 32 + 1.5 | 0, this.data.width);
			var finishy = Math.min((y + core.can.height) / 32 + 1.5 | 0, this.data.height);
		
			for(var ix = startx; ix < finishx; ix++)
			{
				for(var iy = starty; iy < finishy; iy++)
				{
					for(var l = 0; l < 1; l++)
					{
						var tmp = this.data.layers[l].data[ix + (iy * this.data.height)];
						if(tmp != 0)
						{
							var cords = this.getCoords(tmp);
							core.drawImage(sArena.sprites[0], cords[0], cords[1], ix * 32 - x, iy * 32 - y, 32, 32);
						}
					}
				}
			}
		},
		
		drawHeroes: function(x, y)
		{
			for(var i = 0; i < this.objects.heroes.length; i++)
				this.objects.heroes[i].draw(x, y + 10);
		},

		getCoords: function(idx)//convert index to x,y coords
		{
			var idx = idx | 0;
			idx--;

			var perRow = this.data.tilesets[0].imagewidth / this.data.tilewidth;

			var x = (idx % perRow) | 0;
			var y = (idx / perRow) | 0;

			return [x * this.data.tilewidth, y * this.data.tileheight];        
		}
	}
};
