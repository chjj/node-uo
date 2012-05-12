/**
 * Server
 */

require('./logger');

var net = require('net');

var utils = require('./utils')
  , cfg = config = require('./config')
  , ClientPacket = require('./client-packet')
  , dispatcher = require('./dispatcher');

var sockets = [];

var server = net.createServer(function(socket) {
  socket.setNoDelay(true); // turn off the nagle algorithm
  socket.on('data', function(data) {
    // connection packet - ip address / login key
    if (!~sockets.indexOf(socket)) {
      if (data.length !== 4) {
        // they were stuck in the same packet, split them up
        socket.emit('data', data.slice(0, 4)); // wont work with ipv6
        socket.emit('data', data.slice(4));
        return;
      }
      sockets.push(socket);
      console.log('Connection from: ' + slice.call(data).join('.'));
      return;
    }

    if (socket._waitForNext) {
      // need to concatenate the old data buffer with the new one!
      var buff = new Buffer(socket._waitForNext.length + data.length);
      socket._waitForNext.copy(buff, 0);
      data.copy(buff, socket._waitForNext.length);
      data = buff; // now everything can continue as normal
      delete socket._waitForNext;
    }

    var cmd = data[0]
      , temp = ClientPacket.packets[cmd];

    if (!temp) {
      cmd = utils.intToHexStr(cmd);
      console.error('Received unknown packet from client: ' + cmd);
      return;
    }

    // if theres no size, the size is variable, check for length bytes
    var size = temp.size || utils.bytesToInt(data.slice(1, 3));
    if (data.length > size) {
      // multiple packets were sent, need to split them up
      // could check data[size] here to see if its a real command
      socket.emit('data', data.slice(0, size));
      socket.emit('data', data.slice(size));
      return;
    } else if (data.length < size) {
      // the buffer length is smaller than the expected size,
      // the packet mustve gotten chopped off
      // need to wait for the next data event
      // this will get concatenated with the next buffer
      socket._waitForNext = data;
      return;
    }

    // the data is for sure good now, we can translate it into a Packet object
    var packet = new ClientPacket(data, temp);
    socket.emit('packet', packet); // emit a "packet" event
  });

  socket.on('packet', dispatch);

  socket.on('close', function() {
    // remove the socket
    var pos = sockets.indexOf(socket);
    if (~pos) sockets.splice(pos, 1);
    console.log('Connection closed:', socket.remoteAddress);
  });
});

server.listen(cfg.port, cfg.host, function() {
  console.log('Listening on port: ' + cfg.port);
});

var dispatch = function(packet) {
  console.log(packet);

  var handler = dispatcher.handlers[packet.cmd];
  if (handler) {
    //handler.send.call(this, this, packet);
    handler.call(this, this, packet);
  } else {
    console.error('No handler found for packet: ' + packet.cmd);
  }
};

/**
 * Helpers
 */

var slice = [].slice;
