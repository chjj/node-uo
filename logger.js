var Socket = require('net').Socket;
var fs = require('fs');
var inspect = require('util').inspect;

var slice = [].slice;

// log packets
var stream = fs.createWriteStream(__dirname + '/packet.log'); 

var hexy = require('./lib/hexy').hexy;

// inspect without the newlines
var ins = function() {
  var out = inspect.apply(null, arguments);
  return out.replace(/[\r\n]/g, '');
};

Socket.prototype.write = (function() {
  var write = Socket.prototype.write;
  return function(buf) {
    if (Buffer.isBuffer(buf)) {
      stream.write(
        'Server -> Client(' 
        + this.remoteAddress 
        + ')\n' + hexy(buf) + '\n'
      );
    }
    return write.apply(this, arguments);
  };
})();

Socket.prototype.emit = (function() {
  var emit = Socket.prototype.emit;
  return function(ev, data) {
    if (ev === 'data') {
      stream.write(
        'Client(' + this.remoteAddress 
        + ') -> Server\n' + hexy(data) + '\n'
      );
    }
    return emit.apply(this, arguments);
  };
})();

console.log = (function() {
  var log = console.log;
  return function() {
    var args = slice.call(arguments);
    stream.write('STDOUT: ' + args.map(function(v) { 
      return inspect(v); 
    }).join(' ') + '\n\n');
    return log.apply(this, arguments);
  };
})();

console.error = (function() {
  var error = console.error;
  return function() {
    var args = slice.call(arguments);
    stream.write('STDERR: ' + args.map(function(v) { 
      return inspect(v); 
    }).join(' ') + '\n\n');
    return error.apply(this, arguments);
  };
})();