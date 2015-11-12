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

	queueImage: function(filepath) { assets.downloadQueue.push( { type: "img",   path: filepath } ); },
	queueAudio: function(filepath) { assets.downloadQueue.push( { type: "audio", path: filepath } ); },
	queueJSON:  function(filepath) { assets.downloadQueue.push( { type: "json",  path: filepath } ); },
	queueUI:    function(filepath) { assets.downloadQueue.push( { type: "ui",    path: filepath } ); },

	callback: function(){},

	_success: function()
	{
		assets.successCount++;
		if(assets.isDone()) assets.callback();
	},

	_error: function()
	{
		error("Cannot load some file");
		assets.errorCount++;
		if(assets.isDone()) assets.callback();
	},

	downloadAll: function(downloadCallback)
	{
		assets.callback = downloadCallback;

		if(assets.downloadQueue.length === 0)
			downloadCallback();

		for(var i = 0; i < assets.downloadQueue.length; i++)
		{
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
				var that = assets;

				req.onreadystatechange = function(p)
				{
					if(req.readyState == 4)
					{
						if(req.status == 200)
						{
							that.cache[path] = JSON.parse(req.responseText);
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
				var req2 = new XMLHttpRequest();
				req2.open("GET", path, true);
				req2.overrideMimeType("text/plain");
				var that2 = assets;

				req2.onreadystatechange = function()
				{
					if(req2.readyState == 4)
					{
						if(req2.status == 200)
						{
							that2.cache[path] = req2.responseText;
							assets._success();
						}
						else
						{
							assets._error();
						}
					}

				}
				req2.onerror = assets._error;
				req2.send(null);
			}
		}
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
