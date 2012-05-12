var utils = require('./utils')
  , cfg = require('./config')
  , ServerPackets = require('./server-packet').packets
  , data = require('./data')
  , Player = require('./object').Player;

var handlers = {
  // 0x80, Login Request, maybe use names as keys?
  0x80: function(socket, packet) { // login request
    var name = packet.acctName;
    var password = packet.password;
    var nextLoginKey = packet.nextLoginKey; // from uo.cfg ??
    console.log(
      'Login attempt from: ' + socket.remoteAddress,
      '- ACCOUNT: ' + name,
      '- PASS: ' + password
    );
    var account = data.accounts[name];
    if (account && password === account.password) {
      console.log('Successful authentication from (1): '+name);
      if (!cfg.skipServerList) {
        socket.write(ServerPackets.serverList());
      } else {
        // skip the server list and go to char selection
        socket.write(ServerPackets.charSelection());
        Player.authenticated(socket, account);
      }
    } else {
      socket.end(ServerPackets.loginDenied('INCORRECT_NAME_PASS'));
      console.log('Bad password from: ' + name);
      // send bad login packet
    }
  },
  0xA0: function selectedServer(socket, packet) { // client selected a server
    // doesnt really matter which server they selected because theres only one
    var shardIndex = packet.shardIndex; // next two bytes
    console.log('Selected Shard Index: ' + shardIndex);
    socket.end(ServerPackets.connectToGameServer());
    // socket should be closed now!
  },
  0x91: function(socket, packet) { // now the client is connecting to the "real" server
    var loginKey = packet.key; // doesnt really matter what this is
    var name = packet.sid;
    var password = packet.password;

    // now we have to authenticate AGAIN because the client
    // is annoyingly set up for multiple servers
    var account = data.accounts[name];
    if (account && password === account.password) {
      console.log('Successful authentication from (2): ' + name);
      // send character list packet here
      socket.write(ServerPackets.charSelection());
      Player.authenticated(socket, account);
    } else {
      socket.end(ServerPackets.loginDenied('INCORRECT_NAME_PASS'));
    }
  },
  0x5D: function(socket, packet) { // character selected
    if (socket.player) { // make sure the player is actually authenticated
      var characterName = packet.charName;
      var characterSlot = packet.slotChosen;
      console.log('Character Slot: ' + characterSlot);
      socket.player.character = characterName;
      socket.write(ServerPackets.confirmLogin());
      socket.write(ServerPackets.generalInfoSetMap());
      socket.write(ServerPackets.generalInfoMapDiff());
      socket.write(ServerPackets.seasonalInfo());
      socket.write(ServerPackets.clientFeatures());
      socket.write(ServerPackets.drawGamePlayer());
      console.log(characterName + ' logging into world!');
    }
  }
};

exports.handlers = handlers;
