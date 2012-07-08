/**
 * Default Config
 */

var utils = require('./utils');

// need to perform dns lookup if host is not an IP
// var dns = require('dns');

var cfg = {
  name: 'node-uo',
  host: '127.0.0.1',
  port: 2593,
  skipServerList: true
};

try {
  cfg.host = require('os').networkInterfaces().eth0[0].address;
} catch (e) {
  ;
}

cfg.hostBytes = cfg.host.split('.').map(function(v) {
  return +v;
});

cfg.portBytes = utils.intToBytes(cfg.port);

module.exports = cfg;
