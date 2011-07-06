var utils = require('./utils')
  , strToBytes = utils.strToBytes
  , intToBytes = utils.intToBytes;

// not even close to being remotely finished
// this is just an outline of what may come

var packets = exports.packets = {
  '0x0B': { // Send Damage
    sendLength: false,
    build: function sendDamage(mobileID, damage) {
      return [].concat(
        intToBytes(mobileID, 4),
        intToBytes(damage, 2)
      );
    }
  },
  '0x11': { // Status Bar Info
    sendLength: true,
    build: function statusBarInfo(mobile) {
      //var player = this.player;
      var base = [].concat(
          intToBytes(mobile.id, 4)
        , strToBytes(mobile.name, 30)
        , intToBytes(mobile.curHP, 2)
        , intToBytes(mobile.maxHP, 2)
        , intToBytes(mobile.nameChangeFlag, 1) // is it a pet?
        , intToBytes(mobile.statusFlag, 1)
        , intToBytes(mobile.sex, 1) // and race?
        , intToBytes(mobile.str, 2)
        , intToBytes(mobile.dex, 2)
        , intToBytes(mobile.int, 2)
        , intToBytes(mobile.curStam, 2)
        , intToBytes(mobile.maxStam, 2)
        , intToBytes(mobile.curMana, 2)
        , intToBytes(mobile.maxMana, 2)
        , intToBytes(mobile.goldInPack, 4)
        , intToBytes(mobile.armorRating, 2)
        , intToBytes(mobile.weight, 2)
      );
      // NEED MORE DOWN HERE
    }
  },
  // TODO 0x16 and 0x17 --- newschool clients
  '0x1A': { // Object Info
    sendLength: true,
    build: function objectInfo(object) {
      var base = [].concat(
          intToBytes(object.id, 4)
        , intToBytes(object.graphic, 2)
      );
      // more down here
    }
  },
  '0x1B': { // Char Locale and Body
    sendLength: false,
    build: function charBody(mobile) {
      return [].concat(
        intToBytes(mobile.id, 4),
        intToBytes(0x00, 4), // unknown
        intToBytes(mobile.bodyType, 2),
        intToBytes(mobile.x, 2),
        intToBytes(mobile.y, 2),
        intToBytes(0x00, 1), // unknown
        intToBytes(mobile.z, 1),
        intToBytes(mobile.direction, 1),
        intToBytes(0x00, 4), // unknown
        intToBytes(0x00, 4), // unknown
        intToBytes(0x00, 1), // unknown
        intToBytes(SERVER.width-8, 4), // server boundary width minus eight
        intToBytes(SERVER.height, 4), // server boundary height
        intToBytes(0x00, 2), // unknown
        intToBytes(0x00, 4), // unknown
      );
      // more down here
    }
  },
  '0x1C': { // Send Speech
    sendLength: true,
    build: function sendSpeech(mobile) {
      return [].concat(
        [0xFF, 0xFF, 0xFF, 0xFF], //intToBytes(itemID, 4),
        intToBytes(mobile.model, 2),
        intToBytes(typeOfText, 1),
        intToBytes(textColor, 2),
        intToBytes(font, 2),
        strToBytes(mobile.name, 30),
        strToBytes(message), 0x00
      );
      // more down here
    }
  },
  '0x1D': { // Delete Object
    sendLength: false,
    build: function deleteObject() {
      return [].concat(
        intToBytes(itemOrCharID, 4)
      );
    }
  },
  '0x1F': { // Explo
    sendLength: false,
    build: function explo() {
      return [].concat(
        intToBytes(0, 7) // unknown
      );
    }
  },
  '0x20': { // Draw Game Player
    sendLength: false,
    build: function drawGamePlayer() {
      return [].concat(
        intToBytes(creatureID, 4),
        intToBytes(bodyType, 2),
        intToBytes(0x00, 1), // unknown
        intToBytes(skinColor, 2),
        intToBytes(flagByte, 1),
        intToBytes(x, 2),
        intToBytes(y, 2),
        intToBytes(0x00, 2), // unknown
        intToBytes(direction, 1),
        intToBytes(z, 1)
      );
    }
  },
  '0x21': { // Character Move Rejection
    sendLength: false,
    build: function charMoveRejection() {
      return [].concat(
        intToBytes(sequenceNumber, 1),
        intToBytes(x, 2),
        intToBytes(y, 2),
        intToBytes(direction, 1),
        intToBytes(z, 1)
      );
    }
  },
  '0x23': { // Drag Item
    sendLength: false,
    build: function dragItem() {
      return [].concat(
        intToBytes(modelNumber, 2),
        intToBytes(0x00, 3), // unknown
        intToBytes(stackCount, 2),
        intToBytes(sourceID, 4),
        intToBytes(sourceX, 2),
        intToBytes(sourceY, 2),
        intToBytes(sourceZ, 1),
        intToBytes(targetID, 4),
        intToBytes(targetX, 2),
        intToBytes(targetY, 2),
        intToBytes(targetZ, 1)
      );
    }
  },
  '0x25': { // Add item to container
    sendLength: false,
    build: function addItemToContainer() {
      return [].concat(
        intToBytes(itemID, 4),
        intToBytes(itemGraphicID, 2),
        intToBytes(itemIDOffset, 1),
        intToBytes(stackAmount, 2),
        intToBytes(x, 2),
        intToBytes(y, 2),
        // for new school clients: intToBytes(slotIndex, 1),
        intToBytes(containerID, 4),
        intToBytes(color, 2)
      );
    }
  },
  '0x26': { // Kick Player
    sendLength: false,
    build: function kickPlayer() {
      return [].concat(
        intToBytes(idOfGM, 4)
      );
      // END CONCAT
    }
  }





  '0xA8': { // Server List - sent after user is authenticated
    sendLength: true,
    build: function serverList() {
      return [].concat(
        0x5D, // system info flag -- runuo sends 0x5D
          // 0xCC is dont send vid card info, 0x64 is send vid card info
        0x00, 0x01, // number of servers --- 0, 0x01 ??
          // SERVERS START HERE
          0x00, 0x00, // zero-based server index
          utils.strToBytes(cfg.name, 32), // server name! 32 bytes
          0x00, // percent full
          0x00, // timezone
          //3, 0, 0, 127 // server ip to ping, needs to be big-endian!
          cfg.hostBytes.slice().reverse()
      );
    }
  },
  '0x8C': { // Connect to game server - sent after a user selects a server
    sendLength: false,
    build: function connectToGameServer() {
      return [].concat(
        //127, 0, 0, 3, // server IP
        cfg.hostBytes,
        //0x0A, 0x21, // port
        cfg.portBytes,
        0x00, 0x00, 0x00, 0x00 // randomly generated key used by OSI
      );
    }
  },
  // client ver: client sends string,
  // server sends bytes, uosa isnt sending anything during login
  '0xBD': {
    sendLength: true,
    build: function clientVersion() {
      return [].concat(
        0, 0, 0
      );
    }
  },
  '0xA9': { // character selection
    sendLength: true,
    build: function charSelection() {
      return [].concat(
        0x05, // number of characters, slots 5, 6, or 7 ??
          // CHARACTERS START HERE
          strToBytes('Avatar', 30), // character name
          strToBytes('', 30), // character password
          strToBytes('', 30), // character name
          strToBytes('', 30), // character password
          strToBytes('', 30), // character name
          strToBytes('', 30), // character password
          strToBytes('', 30), // character name
          strToBytes('', 30), // character password
          strToBytes('', 30), // character name
          strToBytes('', 30), // character password
        0x01, // number of starting locations (cities)
          strToBytes('Britain', 31), // city name (general name)
          strToBytes('Sweet Dreams Inn', 31), // area of city or town
        0x00, 0x00, 0x00, 0x00 // flags, runuo uses 0x08 by default?
      );
    }
  },
  '0x1B': { // login confirmation
    sendLength: false,
    build: function confirmLogin() {
      return [].concat(
        0x00, 0x00, 0xF5, 0xCF, // player serial
        0x00, 0x00, 0x00, 0x00, // unknown, always zero
        0x01, 0x90, // body type
        0x03, 0xC5, // x-loc
        0x01, 0x25, // y-loc
        0x00, // unknown, always zero
        0x1A, // z-loc
        0x00, // facing
        0x00, 0xFF, 0xFF, 0xFF, // unknown, always zero
        0xFF, 0x00, 0x00, 0x00, // unknown, always zero
        0x00, // unknown, always zero
        0x1C, 0x00, // server boundary width minus eight
        0x10, 0x00, // server boundary height
        0x00, 0x00, // unknown, always zero
        0x00, 0x00, 0x00, 0x00 // unknown, always zero
      );
    }
  },
  '0xBF': { // GENERAL INFO PACKET --- need to handle this differently
    sendLength: true,
    build: function generalInfoSetMap() {
      return [].concat(
        0x00, 0x08, // subcommand
        0x00 // subcommand details FELUCCA IS ZERO
      );
    }
  },
  '0xBF': { // enable map diff, (files) ??
    sendLength: true,
    build: function generalInfoMapDiff() {
      return [].concat(
        0x00, 0x18, // subcommand
        0x00, 0x00, 0x00, 0x04, // subcommand details : number of maps
          // START MAPS - 4 bytes for map patches on each map, 4 bytes for static patches on each map
          0x00, 0x00, 0x00, 0x00,
          0x00, 0x00, 0x00, 0x00,
          0x00, 0x00, 0x00, 0x00,
          0x00, 0x00, 0x00, 0x00,
          0x00, 0x00, 0x00, 0x00,
          0x00, 0x00, 0x00, 0x00,
          0x00, 0x00, 0x00, 0x00,
          0x00, 0x00, 0x00, 0x00
      );
    }
  },
  '0xBC': { // seasonal info
    sendLength: false,
    build: function seasonalInfo() {
      return [].concat(
        0x00, // season flag
        0x01 // play sound?
      );
    }
  },
  '0xB9': { // client features to be enabled
    sendLength: false,
    build: function clientFeatures() {
      return [].concat(
        0x00, 0x00 // feature flag - 0x01 is t2a !! - this is 4 bytes on client 6.0.14.2++
      );
    }
  },
  '0x20': { // drawGamePlayer - uosa sends this twice on login?
    sendLength: false,
    build: function drawGamePlayer() {
      return [].concat(
        0x00, 0x00, 0xF5, 0xCF, // creature id
        0x01, 0x90, // body type
        0x00, // unknown
        0x83, 0xEA, // skin color
        0x80, // flag byte
        0x03, 0xC5, // xLoc
        0x01, 0x25, // yLoc
        0x00, 0x00, // unknown
        0x00, // direction
        0x1A // zLoc
      );
    }
  },
  '0x55': { // login complete
    sendLength: false,
    build: function loginComplete() {
      return [];
    }
  },
  '0x82': { // login denied
    sendLength: false,
    build: (function() {
      var reasons = {
        'INCORRECT_NAME_PASS': 0x00,
        'ALREADY_IN_USE': 0x01,
        'ACCOUNT_BLOCKED': 0x02,
        'BAD_CREDENTIALS': 0x03,
        'BAD_COMMUNICATION': 0x04,
        'CONCURRENCY_LIMIT_MET': 0x05,
        'TIME_LIMIT_MET': 0x06,
        'AUTHENTICATION_FAILURE': 0x07
      };
      return function loginDenied(reason) {
        return [reasons[reason]];
      };
    })()
  }
};

(function() {
  for (var k in packets) (function(k) {
    var packet = packets[k];
    packet.name = packet.build.name;
    packet.cmdHex = k;
    packet.cmdInt = parseInt(k, 16);
    packet.cmd = packet.cmdInt;
    packet.create = function() {
      var out = packet.build.apply(this, arguments);
      var start = [ packet.cmdInt ];
      if (packet.sendLength) {
        // need to add 3 to compensate for the command, and 2 bytes we add
        start = start.concat(intToBytes(out.length + 3, 2));
      }
      out = new Buffer(start.concat(out));
      return out;
    };
    packet.send = function(socket) {
      socket.write(packet.create.apply(packet, arguments));
    };
    packets[packet.build.name] = packet.create;
    packets[packet.cmdInt] = packet.create;
    packets[packet.cmdHex] = packet.create;
  })(k);
})();