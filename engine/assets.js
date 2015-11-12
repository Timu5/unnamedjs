/*
 * Copyright (c) 2015 Mateusz Muszyński
 * All Rights Reserved.
 */

var assets =
{
	successCount: 0,
	errorCount:  0,
	cache:  {},
	downloadQueue: [],
	
	index: 0,

	queueImage: function(filepath) { assets.downloadQueue.push( { type: "img",   path: filepath } ); },
	queueAudio: function(filepath) { assets.downloadQueue.push( { type: "audio", path: filepath } ); },
	queueJSON:  function(filepath) { assets.downloadQueue.push( { type: "json",  path: filepath } ); },
	queueUI:    function(filepath) { assets.downloadQueue.push( { type: "ui",    path: filepath } ); },

	callback: function(){},

	_success: function()
	{
		assets.successCount++;
		assets.downloadAll(assets.callback);
	},

	_error: function()
	{
		error("Cannot load " + assets.downloadQueue[assets.index].path);
		assets.errorCount++;
		assets.downloadAll(assets.callback);
	},

	downloadAll: function(downloadCallback)
	{
		if(assets.isDone())
		{
			downloadCallback();
			return;
		}

		assets.callback = downloadCallback;

		var i = assets.index;
		var path = assets.downloadQueue[i].path;
		if(assets.downloadQueue[i].type == "img")
		{
			var img = new Image();
			img.addEventListener("load", assets._success, false);
			img.addEventListener("error", assets._error, false);
			img.src = path;
			assets.cache[path] = img;
		}
		else if(assets.downloadQueue[i].type == "audio")
		{
			var audio = new Audio();
			audio.onloadeddata = assets._success;
			audio.addEventListener("error", assets._error, false);
			audio.src = path;
			assets.cache[path] = audio;
		}
		else if(assets.downloadQueue[i].type == "json")
		{
			var req = new XMLHttpRequest();
			req.open("GET", path, true);
			req.overrideMimeType("application/json");

			req.onreadystatechange = function(p)
			{
				if(req.readyState == 4)
				{
					if(req.status == 200)
					{
						assets.cache[path] = JSON.parse(req.responseText);
						assets._success();
					}
					else
					{
						assets._error();
					}
				}
			}
			req.onerror = assets._error;
			req.send(null);
		}
		else if(assets.downloadQueue[i].type == "ui")
		{
			var req = new XMLHttpRequest();
			req.open("GET", path, true);
			req.overrideMimeType("text/plain");

			req.onreadystatechange = function()
			{
				if(req.readyState == 4)
				{
					if(req.status == 200)
					{
						 assets.cache[path] = req.responseText;
						assets._success();
					}
					else
					{
						assets._error();
					}
				}
			}
			req.onerror = assets._error;
			req.send(null);
		}
		assets.index++;
	},

	isDone: function()
	{
		return (assets.downloadQueue.length == assets.successCount + assets.errorCount);
	},

	getAsset: function(path)
	{
		return assets.cache[path];
	}
}
