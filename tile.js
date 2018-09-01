var im = require('images');

function pixelRange(i, j, psize, tsize) {
    var hsize = psize.map(s=>0.5*s);
    var imin = i - hsize[0];
    var jmin = j - hsize[1];
    var imax = i + hsize[0];
    var jmax = j + hsize[1];
    var xdelta = [Math.floor(imin / tsize), Math.floor(imax / tsize)];
    var ydelta = [Math.floor(jmin / tsize), Math.floor(jmax / tsize)];
    var idelta = xdelta[0] * tsize;
    var jdelta = ydelta[0] * tsize;
    imin -= idelta; imax -= idelta;
    jmin -= jdelta; jmax -= jdelta;
    return {'xdelta': xdelta, 'ydelta': ydelta, bbox: [imin, jmin, imax, jmax]};
}

function getCenterTile(lon, lat, zoom, tsize) {
    var xf = (lon+180)/360*Math.pow(2,zoom);
    var yf = (1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom);
    var i = Math.floor(xf % 1 * tsize);
    var j = Math.floor(yf % 1 * tsize)
    return [Math.floor(xf), Math.floor(yf), i, j];
}

function test() {
    var psize = 640, tsize = 256;
    var lat = 34.687291, lon = 112.429898; // Luoyang Station
    var centerTile = getCenterTile(lon, lat, 20, tsize);
    console.log(centerTile);
    var pr = pixelRange(centerTile[2], centerTile[3], psize, tsize);
    console.log(pr.xdelta + ', ' + pr.ydelta);
    console.log(pr.bbox);
}

//test();

module.exports.getCenterTile = getCenterTile;
module.exports.pixelRange = pixelRange;

function concatTileSet(tiles, targetInfo, tsize) {
    var tsize = tsize ? tsize : 256;
    // create canvas
    var ncol = targetInfo.xdelta[1] - targetInfo.xdelta[0] + 1;
    var nrow = targetInfo.ydelta[1] - targetInfo.ydelta[0] + 1;
    var canvas = im(ncol * tsize, nrow * tsize);
    
    // merge tiles
    var ntile = 0;
    for (var j = 0; j < nrow; j++) {
        var top = tsize * j;
        for (i = 0; i < ncol; i++) {
            var left = tsize * i;
            if (tiles[ntile]) {
                var tile = im(tiles[ntile]);
                canvas.draw(tile, left, top);
                ntile += 1;
            }
        }
    }
    return canvas;
}

function cropConcatImage(canvas, istart, jstart, psize) {
    return new Promise(function (resolve) {
        // clip tiles
        if (psize.length == 1) {
            var cropped = im(psize, psize);
            cropped = im(canvas, istart, jstart, psize, psize);
            resolve(cropped.encode('jpg', {operation: 100}));
        }
        else {
            var cropped = im(psize[0], psize[1]);
            cropped = im(canvas, istart, jstart, psize[0], psize[1]);
            resolve(cropped.encode('jpg', {operation: 100}));
        }
    });
}

function procTileSet(tiles, targetInfo, tileInfo, psize, tsize) {
    // var hsize = 0.5 * psize;
    return cropConcatImage(
        concatTileSet(tiles, targetInfo, tsize?tsize:256),
        // tileInfo[2] - hsize, tileInfo[3] - hsize, psize
        targetInfo.bbox[0], targetInfo.bbox[1], psize
    );
}

module.exports.procTileSet = procTileSet;