/*
 * Copyright (c) 2015 Mateusz Muszyński
 * All Rights Reserved.
 */

function Hero(heroname, posx, posy)
{
	this.uid      = 0;
	this.name     = heroname;
	this.posX     = posx; // Grid position
	this.posY     = posy;
	this.realX    = posx * 40;
	this.realY    = posy * 40;
	this.rot      = 0; // Map rotation
	this.status   = 0; // 0 - idle, 1 - walk
	this.frame    = 0; // curent animation frame
	this.nextMove = [0, 0];
	this.cnt      = 0; // helper var used in movement
}

Hero.prototype.rotate = function(x, y)//int value from -1 to 1
{
	if(x == 0 && y == 0) return;
	var tmp = ((y + 1) * 3) + (x + 1) | 0;

	switch(tmp)
	{
		case 0: this.rot = 5; break;
		case 1: this.rot = 4; break;
		case 2: this.rot = 3; break;
		case 3: this.rot = 6; break;
		case 4:
		case 8: this.rot = 1; break;
		case 5: this.rot = 2; break;
		case 6: this.rot = 7; break;
		case 7: this.rot = 0; break;
	}
}

Hero.prototype.move = function(x, y)
{
	this.nextMove = [x, y];
	this.status = 1;
	this.cnt = 0;
}

Hero.prototype.update = function(time)
{
	if(this.status == 1)
	{
		this.frame += time / 80;
		if(this.frame > 7.999)
		{
			this.frame = 0;
		}
	}
	
	if(this.status == 1)
	{
		time *= 0.1;

		this.realX += this.nextMove[0] * time;
		this.realY += this.nextMove[1] * time;

		this.rotate(this.nextMove[0], this.nextMove[1]);
		
		this.cnt += 1 * time;

		if(this.cnt >= 40)
		{
			this.posX = this.realX / 40 | 0;
			this.posY = this.realY / 40 | 0;
			if(this.nextMove[0] < 0) this.posX++;
			if(this.nextMove[1] < 0) this.posY++;

			this.realX = this.posX * 40;
			this.realY = this.posY * 40;

			this.cnt = 0;
			this.status = 0;
		}
	}
}

Hero.prototype.draw = function(x, y)
{
	if(this.status == 0) core.drawImage(sArena.sprites[1], 0, this.rot * 64, this.realX - x, this.realY - y, 96, 64);
	else                 core.drawImage(sArena.sprites[1], 96 + (this.frame | 0) * 96, this.rot * 64, this.realX - x, this.realY - y, 96, 64);
}
