var cfg = {
  name: 'node-uo',
  host: '127.0.0.1',
  port: 2593,
  skipServerList: true
};

// need to perform dns lookup if its not an IP
// require('dns');
var utils = require('./utils');
cfg.hostBytes = cfg.host.split('.').map(function(v) { return +v; });
cfg.portBytes = utils.intToBytes(cfg.port);

module.exports = cfg;