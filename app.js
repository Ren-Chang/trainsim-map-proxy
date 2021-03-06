var stream = require('stream');
var express = require('express');
var request = require('request');
var tile = require('./tile.js');
var xhr = require('./xhr.js');

var app = express();

app.get('/maps/api/staticmap', function(req, res) {
    var gsat = 'https://mt1.google.com/vt/lyrs=s&';
    var pxy = null; //'http://localhost:1080';
    // handle query parameters by TS2018 for Google Maps Static API
    var center = req.query.center.split(',').map(parseFloat);
    var lat = center[0], lon = center[1];
    var psize = req.query.size.split('x').map(s=>parseInt(s, 10));
    var zoom = parseInt(req.query.zoom);

    // calculate XYZ scheme tile ranges
    var centerInfo = tile.getCenterTile(lon, lat, zoom, 256);
    var x = centerInfo[0], y = centerInfo[1], i = centerInfo[2], j = centerInfo[3];
    var targetInfo = tile.pixelRange(i, j, psize, 256);
    
    // request and process relevant tiles
    xhr.loadTileSet(gsat, xhr.getTilesParam(
        x, y, targetInfo.xdelta, targetInfo.ydelta
    ), zoom, pxy).then(function(tiles) {
        tile.procTileSet(tiles, targetInfo, centerInfo, psize)
            .then(function (result){
                // send result
                res.header("Content-Type", "image/jpeg");
                var restream = stream.PassThrough();
                restream.end(result);
                restream.pipe(res);
            }).catch(err=>{onError(err, res, 'Error - Send result ');});
    }).catch(err=>{onError(err, res, 'Error - Process tiles');});
});

app.get('/pac.txt', function(req, res) {
    res.header('Content-Type:text/plain');
    res.sendfile('./gmaps.pac');
});

function onError(err, res, msg) {
    res.statusCode = 500;
    res.header("Content-Type", "text/plain");
    res.write([msg, err.message, err.stack].join('\n'));
    res.end();
}

app.listen(6789, function() {
    console.log('Running on port 6789.')
});