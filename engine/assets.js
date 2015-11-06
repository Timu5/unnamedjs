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
			else // JSON
			{
				var req = new XMLHttpRequest();
				req.open("GET", path, true);
				req.overrideMimeType("application/json");
				var that = assets;

				req.onreadystatechange = function()
				{
					if(req.readyState == 4)
					{
						that.cache[path] = JSON.parse(req.responseText);
						assets._success();
					}
				}
				req.onerror = assets._error;
				req.send(null);
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
