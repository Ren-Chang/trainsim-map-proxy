# Train Simulator Map Proxy
This tool provides a workaround for invalid Google Maps overlay in [Train Simulator](https://store.steampowered.com/app/24010/Train_Simulator/) route editor [since July 2018](https://developers.google.com/maps/documentation/maps-static/usage-and-billing#new-payg).

## Dependency
- [`express`](https://www.npmjs.com/package/express)
- [`request`](https://www.npmjs.com/package/request)
- [`images`](https://www.npmjs.com/package/images)

Run `npm install` to install these packages.

## Usage
Change proxy settings of your computer to be `http://127.0.0.1:6789/pac.txt` which is served by the tool to redirect the tile requests from TS to the tool.

If you use another proxy to access Internet or Google services, you should configure this tool to make Internet connections via your proxy. This should be done before running the server by modifying the [proxy string](https://github.com/Ren-Chang/trainsim-map-proxy/blob/master/app.js#L11) in `app.js`.