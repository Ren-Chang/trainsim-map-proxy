var request = require('request');
var querystr = require('querystring');
var ua_modern = 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36';
var ua_legacy = 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.2; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729)';

function getTile(api, params, proxy) {
    return new Promise(function (resolve, reject) {
        var url = api + querystr.stringify(params);
        request.get(url, {
            'headers': {
                'Accept': '*/*',
                'Accept-Encoding': 'gzip',
                'User-Agent': ua_legacy,
            },
            'proxy': proxy,
            'gzip': true,
            'encoding': null
        }, function (err, res, body) {
            if (err)
                reject(err);
            else
                resolve(body);
        })
    });
}

function getTilesParam(x, y, xdelta, ydelta) {
    var params = [];
    for (var j = y + ydelta[0]; j <= y + ydelta[1]; j++) {
        for (var i = x + xdelta[0]; i <= x + xdelta[1]; i++) {
            params.push({'x': i, 'y': j});
        }
    }
    return params;
}

function loadTileSet(api, params, zoom, proxy) {
    var tasks = params.map((query)=>{
        query.z = zoom;
        return getTile(api, query, proxy);
    });
    return Promise.all(tasks);
}

module.exports.getTilesParam = getTilesParam;
module.exports.loadTileSet = loadTileSet;