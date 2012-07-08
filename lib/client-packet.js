/**
 * Client Packets
 */

var utils = require('./utils')
  , bytesToStr = utils.bytesToStr
  , bytesToInt = utils.bytesToInt
  , intToHexStr = utils.intToHexStr;

var ClientPacket = module.exports = function(data, temp) {
  if (!(this instanceof ClientPacket)) {
    return new ClientPacket(data);
  }
  this.data = data;
  this.index = 0;
  this.name = temp.name;
  this.cmd = this.seekInt(1);
  this.cmdHex = intToHexStr(this.cmd);
  this.size = temp.size || this.seekInt(2);
  if (temp.handle) {
    temp.handle.call(this, this);
    delete this.data;
    delete this.index;
  }
};

ClientPacket.prototype = {
  seek: function(n) {
    if (this.done) {
      return Buffer(Array(n).map(function(){return 0;}));
    }
    try {
      var data = this.data.slice(this.index, this.index + n);
      this.index += n;
      return data;
    } catch(e) {
      this.done = true;
      return this.seek();
    }
  },
  seekStr: function(n) {
    return this.done ? '' : bytesToStr(this.seek(n));
  },
  seekInt: function(n) {
    return this.done ? 0 : bytesToInt(this.seek(n));
  },
  reset: function() {
    this.index = 0;
    return this;
  },
  get remaining() {
    return this.done ? 0 : (this.data.length - this.index);
  },
  merge: function(obj) {
    for (var k in obj) {
      this[k] = obj[k];
    }
    return this;
  }
};

ClientPacket.packets = {
  0x00: {
    name: 'Create Character',
    size: 104,
    handle: function(packet) {
      packet.pattern1 = packet.seek(4);
      packet.pattern2 = packet.seek(4);
      packet.pattern3 = packet.seek(1);
      packet.charName = packet.seekStr(30);
      packet.unknown0 = packet.seek(2);
      packet.clientFlag = packet.seekInt(4);
      packet.unknown1 = packet.seek(4);
      packet.loginCount = packet.seekInt(4);
      packet.profession = packet.seekInt(1);
      packet.unknown2 = packet.seek(15);
      packet.sex = packet.seekInt(1); // int or string?
      packet.str = packet.seekInt(1);
      packet.dex = packet.seekInt(1);
      packet.int = packet.seekInt(1);
      packet.skill1 = packet.seekInt(1);
      packet.skill1value = packet.seekInt(1);
      packet.skill2 = packet.seekInt(1);
      packet.skill2value = packet.seekInt(1);
      packet.skill3 = packet.seekInt(1);
      packet.skill3value = packet.seekInt(1);
      packet.skinColor = packet.seekInt(2);
      packet.hairStyle = packet.seekInt(2);
      packet.hairColor = packet.seekInt(2);
      packet.facialHair = packet.seekInt(2);
      packet.facialHairColor = packet.seekInt(2);
      packet.locationIndex = packet.seekInt(2);
      packet.unknown3 = packet.seek(2);
      packet.slot = packet.seekInt(2);
      packet.clientIP = packet.seek(4);
      packet.shirtColor = packet.seekInt(2);
      packet.pantsColor = packet.seekInt(2);
    }
  },
  0x01: {
    name: 'Disconnect Notification',
    size: 5
  },
  0x02: {
    name: 'Move Request',
    size: 7,
    handle: function(packet) {
      packet.direction = packet.seekInt(1);
      packet.sequenceNumber = packet.seekInt(1);
      packet.fastWalkPreventionKey = packet.seekInt(4);
    }
  },
  0x03: {
    name: 'Talk Request',
    size: 0, // variable size
    handle: function(packet) {
      packet.speechType = packet.seekInt(1);
      packet.color = packet.seekInt(2);
      packet.font = packet.seekInt(2);
      packet.msg = packet.seekStr(packet.remaining);
    }
  },
  0x04: {
    name: 'Request God Mode', // god client
    size: 2,
    handle: function(packet) {
      packet.mode = packet.seekInt(1);
    }
  },
  0x05: {
    name: 'Request Attack',
    size: 5,
    handle: function(packet) {
      packet.id = packet.seekInt(4);
    }
  },
  0x06: {
    name: 'Double Click',
    size: 5,
    handle: function(packet) {
      packet.id = packet.seekInt(4);
    }
  },
  0x07: {
    name: 'Pick Up Item',
    size: 7,
    handle: function(packet) {
      packet.id = packet.seekInt(4);
      packet.quantity = packet.seekInt(2);
    }
  },
  0x08: {
    name: 'Drop Item',
    size: 14,
    handle: function(packet) {
      packet.id = packet.seekInt(4);
      packet.x = packet.seekInt(2);
      packet.y = packet.seekInt(2);
      packet.z = packet.seekInt(1);
      packet.container = packet.seekInt(4);
    }
  },
  0x09: {
    name: 'Single Click',
    size: 5,
    handle: function(packet) {
      packet.id = packet.seekInt(4);
    }
  },
  0x0A: {
    name: 'Edit', // god client
    size: 11,
    handle: function(packet) {
      packet.sub = packet.seekInt(1);
      packet.newX = packet.seekInt(2);
      packet.newY = packet.seekInt(2);
      packet.newID = packet.seekInt(2);
      packet.newZ = packet.seekInt(1);
      packet.hue = packet.seekInt(2);
    }
  },
  0x12: {
    name: 'Request Use',
    size: 0, // variable
    handle: function(packet) {
      packet.type = packet.seekInt(1);
      switch (packet.type) {
        case 0x24: // skill
          break;
        case 0x56: // spell
          break;
        case 0x58: // open door
          break;
        case 0xC7: // action
          break;
      }
    }
  },
  0x13: {
    name: 'Drop->Wear Item',
    size: 10,
    handle: function(packet) {
      packet.id = packet.seekInt(4);
      packet.layer = packet.seekInt(1);
      packet.playerID = packet.seekInt(4);
    }
  },
  0x14: {
    name: 'Send Elevation',
    size: 6,
    handle: function(packet) {
      packet.x = packet.seekInt(2);
      packet.y = packet.seekInt(2);
      packet.z = packet.seekInt(1);
    }
  },
  0x1E: {
    name: 'Control Animation',
    size: 4,
    handle: function(packet) {
      packet.unknown = packet.seekInt(3);
    }
  },
  0x34: {
    name: 'Get Player Status',
    size: 10,
    handle: function(packet) {
      packet.unknown = packet.seekInt(4);
      packet.type = packet.seekInt(1);
      packet.playerID = packet.seekInt(4);
    }
  },
  0x35: {
    name: 'Add Resource', // god client
    size: 653,
    handle: function(packet) {
      packet.unknown0 = packet.seek(1);
      packet.unknown1 = packet.seek(1);
      packet.tileType = packet.seekInt(2);
      packet.internalResourceName = packet.seek(127);
      packet.seek(1); // null terminator
      packet.foodResourceName = packet.seek(127);
      packet.seek(1); // null terminator
      packet.shelterResourceName = packet.seek(127);
      packet.seek(1); // null terminator
      packet.desireResourceName = packet.seek(127);
      packet.seek(1); // null terminator
      packet.productionResourceName = packet.seek(127);
      packet.seek(1); // null terminator
      packet.internalResourceName = packet.seek(127);
      packet.seek(1); // null terminator
      packet.makeConsumer = packet.seek(4);
      packet.makeProducer = packet.seek(4);
    }
  },
  0x37: {
    name: 'Move Item', // god client
    size: 8,
    handle: function(packet) {
      packet.id = packet.seekInt(4);
      packet.z = packet.seekInt(1);
      packet.y = packet.seekInt(1);
      packet.x = packet.seekInt(1);
    }
  },
  0x38: {
    name: 'Pathfinding',
    size: 7,
    handle: function(packet) {
      packet.x = packet.seekInt(2);
      packet.y = packet.seekInt(2);
      packet.z = packet.seekInt(2);
    }
  },
  0x3B: {
    name: 'Buy Items',
    size: 0, // variable
    handle: function(packet) {
      packet.vendorID = packet.seekInt(4);
      packet.flag = packet.seekInt(1);
      packet.items = [];
      while (packet.remaining) {
        packet.items.push({
          unknown: packet.seek(1),
          id: packet.seekInt(4),
          quantity: packet.seekInt(2)
        });
      }
    }
  },
  0x45: {
    name: 'Version OK',
    size: 5,
    handle: function(packet) {
      packet.unknown = packet.seekInt(4);
    }
  },
  0x46: {
    name: 'New Artwork',
    size: 0, // variable
    handle: function(packet) {
      packet.tileID = packet.seekInt(4);
      packet.artInfo = packet.seek(packet.remaining); // from art.mul
    }
  },
  0x47: {
    name: 'New Terrain',
    size: 11,
    handle: function(packet) {
      packet.x = packet.seekInt(2);
      packet.y = packet.seekInt(2);
      packet.id = packet.seekInt(2);
      packet.width = packet.seekInt(2);
      packet.height = packet.seekInt(2);
    }
  },
  0x48: {
    name: 'New Animation',
    size: 73,
    handle: function(packet) {
      packet.tileID = packet.seekInt(4);
      packet.frames = packet.seek(64);
      packet.unknown = packet.seekInt(1);
      packet.frameCount = packet.seekInt(1);
      packet.frameInterval = packet.seekInt(1);
      packet.startInterval = packet.seekInt(1);
    }
  },
  0x49: {
    name: 'New Hues',
    size: 93,
    handle: function(packet) {
      packet.id = packet.seekInt(4); // hueID
      packet.values = packet.seek(32); // hueValues
      packet.start = packet.seekInt(2);
      packet.end = packet.seekInt(2);
      packet.hueName = packet.seekStr(20); // hueName
    }
  },
  0x4A: {
    name: 'Delete Art',
    size: 5,
    handle: function(packet) {
      packet.id = packet.seekInt(4); // artID
    }
  },
  0x4B: {
    name: 'Check Client Version',
    size: 9,
    handle: function(packet) {
      packet.unknown = packet.seek(8);
    }
  },
  0x4C: {
    name: 'Script Names',
    size: 0, // variable
    handle: function(packet) {
      packet.data = [];
      while (packet.remaining) {
        packet.data.push(packet.seek(3));
      }
    }
  },
  0x4D: {
    name: 'Edit Script File',
    size: 0, // variable
    handle: function(packet) {
      packet.data = [];
      while (packet.remaining) {
        packet.data.push(packet.seek(3));
      }
    }
  },
  0x50: {
    name: 'Board Header',
    size: 0, // variable
    handle: function(packet) {
      packet.data = [];
      while (packet.remaining) {
        packet.data.push(packet.seek(3));
      }
    }
  },
  0x51: {
    name: 'Board Message',
    size: 0, // variable
    handle: function(packet) {
      packet.data = [];
      while (packet.remaining) {
        packet.data.push(packet.seek(3));
      }
    }
  },
  0x52: {
    name: 'Board Post Message',
    size: 0, // variable
    handle: function(packet) {
      packet.data = [];
      while (packet.remaining) {
        packet.data.push(packet.seek(3));
      }
    }
  },
  0x57: {
    name: 'Update Regions',
    size: 110,
    handle: function(packet) {
      packet.unknown = packet.seek(109);
    }
  },
  0x58: {
    name: 'Add Region',
    size: 106,
    handle: function(packet) {
      packet.regionName = packet.seekStr(40);
      packet.unknown = packet.seek(4);
      packet.x = packet.seekInt(2);
      packet.y = packet.seekInt(2);
      packet.width = packet.seekInt(2);
      packet.height = packet.seekInt(2);
      packet.z1 = packet.seekInt(2);
      packet.z2 = packet.seekInt(2);
      packet.description = packet.seekStr(40);
      packet.sound = packet.seekInt(2);
      packet.music = packet.seekInt(2);
      packet.soundNight = packet.seekInt(2);
      packet.dungeon = packet.seekInt(1);
      packet.lightLevel = packet.seekInt(2);
    }
  },
  0x59: {
    name: 'New Context FX',
    size: 0, // variable
    handle: function(packet) {
      packet.data = [];
      while (packet.remaining) {
        packet.data.push(packet.seek(3));
      }
    }
  },
  0x5A: {
    name: 'Update Context FX',
    size: 0, // variable
    handle: function(packet) {
      packet.data = [];
      while (packet.remaining) {
        packet.data.push(packet.seek(3));
      }
    }
  },
  0x5C: {
    name: 'Restart Version',
    size: 2,
    handle: function(packet) {
      packet.unknown = packet.seek(1);
    }
  },
  0x5D: {
    name: 'Login Character',
    size: 73,
    handle: function(packet) {
      packet.pattern1 = packet.seek(4);
      packet.charName = packet.seekStr(30);
      packet.unknown0 = packet.seek(2);
      packet.clientFlag = packet.seekInt(4);
      packet.unknown1 = packet.seek(4);
      packet.loginCount = packet.seekInt(4);
      packet.unknown2 = packet.seek(16);
      packet.slotChosen = packet.seekInt(4);
      packet.clientIP = packet.seek(4);
    }
  },
  0x5E: {
    name: 'Server Listing',
    size: 0, // variable
    handle: function(packet) {
      packet.data = [];
      while (packet.remaining) {
        packet.data.push(packet.seek(3));
      }
    }
  },
  0x5F: {
    name: 'Server List Add Entry',
    size: 49,
    handle: function(packet) {
      packet.data = packet.seek(48);
    }
  },
  0x60: {
    name: 'Server List Remove Entry',
    size: 5,
    handle: function(packet) {
      packet.id = packet.seekInt(4); // entry id
    }
  },
  0x61: {
    name: 'Remove Static Object',
    size: 9,
    handle: function(packet) {
      packet.x = packet.seekInt(2);
      packet.y = packet.seekInt(2);
      packet.z = packet.seekInt(2);
      packet.itemID = packet.seekInt(2);
    }
  },
  0x62: {
    name: 'Move Static Object',
    size: 15,
    handle: function(packet) {
      packet.oldX = packet.seekInt(2);
      packet.oldY = packet.seekInt(2);
      packet.oldZ = packet.seekInt(2);
      packet.itemID = packet.seekInt(2);
      packet.x = packet.seekInt(2);
      packet.y = packet.seekInt(2);
      packet.z = packet.seekInt(2);
    }
  },
  0x63: {
    name: 'Load Area',
    size: 13,
    handle: function(packet) {
      packet.unknown = packet.seek(12);
    }
  },
  0x64: {
    name: 'Load Area Request',
    size: 1
  },
  0x69: {
    name: 'Change Text Color',
    size: 5,
    handle: function(packet) {
      packet.blockSize = packet.seekInt(2);
      packet.unknown1 = packet.seek(2);
    }
  },
  0x75: {
    name: 'Rename Character',
    size: 35,
    handle: function(packet) {
      packet.playerID = packet.seekInt(4);
      packet.newName = packet.seekStr(30);
    }
  },
  0x7D: {
    name: 'Response To Dialog Box',
    size: 13,
    handle: function(packet) {
      packet.dialogID = packet.seekInt(4);
      packet.menuID = packet.seekInt(2);
      packet.index = packet.seekInt(2);
      packet.modelNum = packet.seekInt(2);
      packet.color = packet.seekInt(2);
    }
  },
  0x80: {
    name: 'Login Request',
    size: 62,
    handle: function(packet) {
      packet.acctName = packet.seekStr(30);
      packet.password = packet.seekStr(30);
      packet.nextLoginKey = packet.seekInt(1);
    }
  },
  0x83: {
    name: 'Delete Character',
    size: 39,
    handle: function(packet) {
      packet.password = packet.seekStr(30);
      packet.charIndex = packet.seekInt(4);
      packet.clientIP = packet.seekInt(4);
    }
  },
  // skip packet 0x8D
  0x91: {
    name: 'Game Server Login',
    size: 65,
    handle: function(packet) {
      packet.key = packet.seekInt(4);
      packet.sid = packet.seek(30);
      packet.password = packet.seekStr(30);
    }
  },
  0x9B: {
    name: 'Request Help',
    size: 258,
    handle: function(packet) {
      packet.unknown = packet.seek(257);
    }
  },
  0x9F: {
    name: 'Sell List Reply',
    size: 0, // variable
    handle: function(packet) {
      packet.vendorID = packet.seekInt(4);
      packet.itemCount = packet.seekInt(2);
      packet.items = [];
      while (packet.remaining) {
        packet.items.push({
          id: packet.seekInt(4),
          quantity: packet.seekInt(2)
        });
      }
    }
  },
  0xA0: {
    name: 'Select Server',
    size: 3,
    handle: function(packet) {
      packet.shardIndex = packet.seekInt(2);
    }
  },
  0xA4: {
    name: 'Client Specs',
    size: 149,
    handle: function(packet) {
      packet.data = packet.seek(148);
    }
  },
  0xA7: {
    name: 'Request Tip Window',
    size: 4,
    handle: function(packet) {
      packet.lastTip = packet.seekInt(2);
      packet.flag = packet.seekInt(1);
    }
  },
  0xAC: {
    name: 'Gump Text Entry Dialog Reply',
    size: 0, // variable
    handle: function(packet) {
      packet.id = packet.seekInt(4);
      packet.type = packet.seekInt(1);
      packet.index = packet.seekInt(1);
      packet.unknown = packet.seek(3);
      packet.reply = packet.seekStr(packet.remaining);
    }
  },
  0xAD: {
    name: 'Speech Request',
    size: 0, // variable
    handle: function(packet) {
      packet.type = packet.seekInt(1);

      packet.color = packet.seekInt(2);
      packet.font = packet.seekInt(2);
      packet.language = packet.seekStr(4);

      if (packet.type & 0xC0) {
        // crazy stuff here
      }

      packet.msg = packet.seekStr(packet.remaining);
      // this probably wont work without figuring out the weird stuff happening above
    }
  },
  0xB1: {
    name: 'Gump Menu Selection',
    size: 0, // variable
    handle: function(packet) {
      var i = 0, id, len;
      packet.id = packet.seekInt(4);
      packet.gumpID = packet.seekInt(4);
      packet.buttonID = packet.seekInt(4);
      packet.switchCount = i = packet.seekInt(4);
      packet.switches = [];
      while (i--) {
        packet.switches.push({id: packet.seekInt(4)});
      }
      packet.textCount = i = packet.seekInt(4);
      packet.textEntries = [];
      while (i--) {
        packet.textEntries.push({
          id: id = packet.seekInt(2),
          len: len = packet.seekInt(2),
          text: packet.seekStr(len * 2),
        });
      }
    }
  },
  0xB3: {
    name: 'Chat Text', // UNFINISHED
    size: 0, // variable
    handle: function(packet) {
      packet.unicodeLanguageCode = packet.seekInt(4);
      packet.type = packet.seekInt(2); // subcommand
    }
  },
  0xB5: {
    name: 'Open Chat Window',
    size: 64,
    handle: function(packet) {
      packet.chatName = packet.seekStr(63);
    }
  },
  0xB6: {
    name: 'Send Help Request',
    size: 9,
    handle: function(packet) {
      packet.id = packet.seekInt(4);
      packet.lang = packet.seekInt(1);
      packet.langName = packet.seekStr(3);
    }
  },
  0xC5: {
    name: 'Invalid Map',
    size: 1
  },
  0xD9: {
    name: 'Other Client Specs Packet',
    size: 0, // variable
    handle: function(packet) {
      packet.unknown0 = packet.seek(1);
      packet.instanceID = packet.seekInt(4);
      packet.osMajor = packet.seekInt(4);
      packet.osMinor = packet.seekInt(4);
      packet.osRevision = packet.seekInt(4);

      packet.cpuManufacturer = packet.seekInt(4);
      packet.cpuFamily = packet.seekInt(4);
      packet.cpuModel = packet.seekInt(4);
      packet.cpuClockSpeed = packet.seekInt(4);
      packet.cpuQuantity = packet.seekInt(1);

      packet.memory = packet.seekInt(4);
      packet.screenWidth = packet.seekInt(4);
      packet.screenHeight = packet.seekInt(4);
      packet.screenDepth = packet.seekInt(4);
      packet.dxVersion = packet.seekInt(2);
      packet.dxMinor = packet.seekInt(2);

      packet.videoCard = packet.seek(76); // string?
      packet.videoCardVendorID = packet.seekInt(4);
      packet.videoCardDeviceID = packet.seekInt(4);
      packet.videoCardMemory = packet.seekInt(4);

      packet.distribution = packet.seekInt(1);
      packet.clientsRunning = packet.seekInt(1);
      packet.clientsInstalled = packet.seekInt(1);
      packet.partialInstalled = packet.seekInt(1);
      packet.unknown1 = packet.seek(1);
      packet.langCode = packet.seekInt(4);
      packet.unknown2 = packet.seek(67);
    }
  },
  // TODO: new school client packets: 0xE0 to 0xEF

  // START: packets sent by both the client and server
  0x0C: {
    name: 'Edit Tile Data', // god client
    size: 0, // variable
    handle: function(packet) {
      packet.tileNumber = packet.seekInt(2);
      packet.tileDataFlags = packet.seekInt(4);
      packet.weight = packet.seekInt(1);
      packet.quality = packet.seekInt(1);
      packet.unknown0 = packet.seek(2);
      packet.unknown1 = packet.seek(1);
      packet.quantity = packet.seekInt(1);
      packet.animationFrameNumber = packet.seekInt(2);
      packet.unknown2 = packet.seek(1);
      packet.hue = packet.seekInt(1);
      packet.unknown3 = packet.seek(1);
      packet.value = packet.seekInt(1);
      packet.height = packet.seekInt(1);
      packet.itemName = packet.seekStr(20);
    }
  },
  0x15: {
    name: 'Follow',
    size: 9,
    handle: function(packet) {
      packet.toFollow = packet.seekInt(4);
      packet.isFollowing = packet.seekInt(4);
    }
  },
  0x22: {
    name: 'Character Move/Resync Request',
    size: 3,
    handle: function(packet) {
      packet.moveSequenceKey = packet.seekInt(1);
      packet.notoFlag = packet.seekInt(1);
    }
  },
  0x2C: {
    name: 'Resurrection Menu',
    size: 2,
    handle: function(packet) {
      packet.action = packet.seekInt(1);
    }
  },
  0x39: {
    name: 'Group Remove',
    size: 9,
    handle: function(packet) {
      packet.playerID = packet.seekInt(4);
      packet.targetID = packet.seekInt(4);
    }
  },
  0x3A: {
    name: 'Send Skills',
    size: 0, // variable
    handle: function(packet) {
      var id, skill;
      packet.type = packet.seekInt(1);
      packet.skills = [];
      while (packet.remaining) {
        id = packet.seekInt(2);
        if (packet.type === 0x00 && id === 0x00) {
          break; // null terminated ??
        }
        skill = {
          id: id,
          val: packet.seekInt(2),
          realVal: packet.seekInt(2),
          lock: packet.seekInt(1)
        };
        if (packet.type === 2 || packet.type === 0xDF) {
          skill.cap = packet.seekInt(2);
        }
        packet.skills.push(skill);
      }
      // --------- TOO MANY CURLY BRACES I CANT SEE
    }
    // --- END HANDLE
  },
  0x56: {
    name: 'Map Packet',
    size: 11,
    handle: function(packet) {
      packet.mapObjectID = packet.seekInt(4);
      packet.actionFlag = packet.seekInt(1);
      packet.pinIDOrPlottingFlag = packet.seekInt(1);
      packet.x = packet.seekInt(2);
      packet.y = packet.seekInt(2);
    }
  },
  0x66: {
    name: 'Books',
    size: 0, // variable
    handle: function(packet) {
      var page, lineCount, chars, ch;
      packet.bookID = packet.seekInt(4);
      packet.pageCount = packet.seekInt(2);
      packet.pages = [];
      while (packet.remaining) {
        page = {
          number: packet.seekInt(2),
          lines: []
        };
        lineCount = packet.seekInt(2);
        while (lineCount--) {
          chars = [];
          while (ch = packet.seekInt(1)) {
            chars.push(ch);
          }
          page.lines.push(bytesToStr(new Buffer(chars)));
        }
        packet.pages.push(page);
      }
      // to many curly braces
    }
  },
  0x6C: {
    name: 'Target Cursor Commands',
    size: 19,
    handle: function(packet) {
      packet.cursorTarget = packet.seekInt(1);
      packet.cursorID = packet.seekInt(4);
      packet.cursorType = packet.seekInt(1);
      packet.clickedOnID = packet.seekInt(4);
      packet.x = packet.seekInt(2);
      packet.y = packet.seekInt(2);
      packet.unknown = packet.seekInt(1);
      packet.z = packet.seekInt(1);
      packet.graphic = packet.seekInt(2);
    }
  },
  0x6F: {
    name: 'Secure Trading',
    size: 0, // variable
    handle: function(packet) {
      packet.typeFlag = packet.seekInt(1);
      packet.playerID = packet.seekInt(4);
      packet.containerOneID = packet.seekInt(4);
      packet.containerTwoID = packet.seekInt(4);
      packet.hasName = packet.seekInt(1);
      if (packet.hasName) {
        packet.playerName = packet.seekStr(packet.remaining);
      }
    }
  },
  0x71: { // UNFINISHED
    name: 'Bulletin Board Messages',
    size: 0, // variable
    handle: function(packet) {
      packet.subCmd = packet.seekInt(1); // subcommand
      // subcommand logic goes here
    }
  },
  0x72: {
    name: 'Request War Mode',
    size: 5,
    handle: function(packet) {
      packet.flag = packet.seekInt(1);
      packet.unknown = packet.seek(3);
    }
  },
  0x73: {
    name: 'Ping Message',
    size: 2,
    handle: function(packet) {
      packet.sequenceNumber = packet.seekInt(1);
    }
  },
  0x93: {
    name: 'Old Book Header',
    size: 99,
    handle: function(packet) {
      packet.bookID = packet.seekInt(4);
      packet.writeFlag = packet.seekInt(1);
      packet.unknown = packet.seek(1);
      packet.pageCount = packet.seekInt(2);
      packet.title = packet.seekStr(60);
      packet.author = packet.seekStr(30);
    }
  },
  0x95: {
    name: 'Dye Window',
    size: 9,
    handle: function(packet) {
      packet.dyedItemID = packet.seekInt(4);
      packet.modelFromServer = packet.seekInt(2);
      packet.modelFromClient = packet.seekInt(2);
    }
  },
  // TODO: 0x98 --- all names 3d client
  0x99: {
    name: 'Multi Placement View', // for houses/boats
    size: 26,
    handle: function(packet) {
      packet.request = packet.seekInt(1); // should be 0 from client
      packet.deedID = packet.seekInt(4);
      packet.unknown0 = packet.seek(12);
      packet.multiModel = packet.seekInt(2);
      packet.unknown1 = packet.seek(6);
    }
  },
  0x9A: {
    name: 'Console Entry Prompt',
    size: 0, // variable
    handle: function(packet) {
      packet.id = packet.seekInt(4);
      packet.promptID = packet.seekInt(4);
      packet.type = packet.seekInt(4); // zero when ESC is pressed
      packet.text = packet.seekStr(packet.remaining);
    }
  },
  0xB8: {
    name: 'Request Char Profile',
    size: 0, // variable
    handle: function(packet) {
      packet.mode = packet.seekInt(1);
      packet.id = packet.seekInt(4);
      // if update request
      if (packet.remaining) {
        packet.cmdType = packet.seekInt(2); // 0x0001 is update
        packet.msglen = packet.seekInt(2);
        packet.newProfileText = packet.seekStr(packet.msglen);
      }
    }
  },
  0xBB: {
    name: 'Ultima Messenger',
    size: 9,
    handle: function(packet) {
      packet.id1 = packet.seekInt(4);
      packet.id2 = packet.seekInt(4);
    }
  },
  0xBD: {
    name: 'Client Version',
    size: 0, // variable
    handle: function(packet) {
      packet.version = packet.seekStr(packet.size-3);
    }
  },
  0xBE: {
    name: 'Assist Version',
    size: 0, // variable
    handle: function(packet) {
      packet.assistVersion = Array.prototype.slice.call(packet.seek(4)).join('.');
      packet.clientVersion = packet.seekStr(packet.remaining);
    }
  },
  0xBF: {
    name: 'General Information Packet',
    size: 0, // variable
    handle: (function() {
      // sub commands
      var sub = {
        0x05: function screenSize(packet) {
          packet.type = 'screenSize';
          packet.seek(2); // unknown
          packet.screenX = packet.seekInt(2);
          packet.screenY = packet.seekInt(2);
          packet.seek(2); // unknown
        },
        0x06: function partySystem(packet) {
          var subsub = packet.seekInt(2); // 2 bytes??
          switch (subsub) {
            case 1: // add party member
              packet.type = 'partyAddPlayer';
              packet.playerID = packet.seekInt(4);
              break;
            case 2: // remove party member
              packet.type = 'partyRemovePlayer';
              packet.playerID = packet.seekInt(4);
              break;
            case 3: // send party member a message
              packet.type = 'partySendMessageToPlayer';
              packet.playerID = packet.seekInt(4);
              packet.msg = packet.seekStr(packet.remaining);
              break;
            case 4: // tell whole party a message
              packet.type = 'partySendMessage';
              packet.msg = packet.seekStr(packet.remaining);
              break;
            case 6: // party can loot me?
              packet.type = 'partyCanLootMe';
              packet.canLoot = packet.seekInt(1);
              break;
            case 7: // party invitation? is this sent by the client?
              packet.type = 'partyInvite';
              packet.partyLeaderID = packet.seekInt(4);
              break;
            case 8: // accept party invite
              packet.type = 'partyAcceptInvite';
              packet.partyLeaderID = packet.seekInt(4);
              break;
            case 9: // decline party invite
              packet.type = 'partyDeclineInvite';
              packet.partyLeaderID = packet.seekInt(4);
              break;
            default: console.error('Bad subsubcommand for party packet.');
          }
        },
        0x0A: function wrestlingStun(packet) {
          packet.type = 'wrestleStun';
        },
        0x0B: function clientLanguage(packet) {
          packet.type = 'clientLanguage';
          packet.lang = packet.seekStr(3);
        },
        0x0C: function closedStatusGump(packet) {
          packet.type = 'closedStatusGump';
          packet.characterID = packet.seekInt(4);
        },
        0x0E: function $3dClientAction(packet) {
          packet.type = '3dClientAction';
          packet.animationID = packet.seekInt(4); // need to interpret this, see reference
        },
        0x0F: function clientType(packet) {
          packet.type = 'clientType';
          packet.seek(1); // unknown
          packet.clientTypeFlag = packet.seekInt(4);
        },
        0x13: function requestPopupMenu(packet) {
          packet.type = 'requestPopupMenu';
          packet.characterID = packet.seekInt(4);
        },
        0x15: function popupEntrySelection(packet) {
          packet.type = 'popupEntrySelection';
          packet.characterID = packet.seekInt(4);
          packet.entryTag = packet.seekInt(2);
        },
        0x1A: function extendedStats(packet) {
          packet.type = 'extendedStats';
          packet.stat = packet.seekInt(1); // str, dex, int
          packet.status = packet.seekInt(1); // up, down, locked
        },
        0x1C: function spellSelected(packet) {
          packet.type = 'spellSelected';
          packet.seek(2); // unknown
          packet.selectedSpell = packet.seekInt(2);
        },
        0x1E: function requestHouseState(packet) {
          packet.type = 'requestHouseState';
          packet.houseID = packet.seekInt(4);
        },
        0x24: function unknown(packet) {
          packet.type = 'unknown';
          packet.seek(1); // unknown
        },
        0x2C: function useTargetedItem(packet) {
          packet.type = 'useTargetedItem';
          packet.itemID = packet.seekInt(4);
          packet.targetID = packet.seekInt(4);
        },
        0x2D: function castTargetedSpell(packet) {
          packet.type = 'castTargetedSpell';
          packet.spellID = packet.seekInt(2);
          packet.targetID = packet.seekInt(4);
        },
        0x2E: function useTargetedSkill(packet) {
          packet.type = 'useTargetedSkill';
          packet.skillID = packet.seekInt(2);
          packet.targetID = packet.seekInt(4);
        },
        0x2F: function newSchoolHouseMenuGump(packet) {
          packet.type = 'newSchoolHouseMenuGump';
          // more sub sub command nonsense here
        },
        0x32: function toggleGargoyleFlying(packet) {
          packet.type = 'toggleGargoyleFlying';
          packet.seek(4); // unknown
          packet.seek(2); // unknown
        }
      };
      return function(packet) {
        packet.subCmd = packet.seekInt(2);
        var subCmd = packet.subCmd;
        if (!sub[subCmd]) {
          console.log('Client sent unknown subcommand for 0xBF: ' + subCmd);
          return;
        }
        return sub[subCmd].call(this, packet);
      };
    })()
  },
  0xC2: {
    name: 'Unicode Text Entry',
    size: 0, // variable
    handle: function(packet) {
      packet.playerID = packet.seekInt(4);
      packet.messageID = packet.seekInt(4);
      packet.unknown = packet.seek(4);
      packet.langCode = packet.seekStr(3);
      packet.text = packet.seekStr(packet.remaining);
    }
  },
  0xC8: {
    name: 'Client View Range',
    size: 2,
    handle: function(packet) {
      packet.range = packet.seekInt(1);
    }
  },
  0xC9: {
    name: 'Get Area Server Ping', // god client
    size: 6,
    handle: function(packet) {
      packet.sequence = packet.seekInt(1);
      packet.tickCount = packet.seekInt(4);
    }
  },
  0xCA: {
    name: 'Get User Server Ping', // god client
    size: 6,
    handle: function(packet) {
      packet.sequence = packet.seekInt(1);
      packet.tickCount = packet.seekInt(4);
    }
  },
  0xD0: {
    name: 'Configuration File',
    size: 0, // variable
    handle: function(packet) {
      packet.type = packet.seekInt(1);
      packet.unknown = packet.seek(packet.size-4);
    }
  },
  0xD1: {
    name: 'Logout Status',
    size: 2, // might be 1 byte if sent by the client??
    handle: function(packet) {
      //packet.flag = packet.seekInt(1);
    }
  },
  0xD4: {
    name: 'New Book Header',
    size: 0, // variable
    handle: function(packet) {
      packet.bookID = packet.seekInt(4);
      packet.flag1 = packet.seekInt(1);
      packet.flag2 = packet.seekInt(1);
      packet.pageCount = packet.seekInt(2);
      packet.authorLength = packet.seekInt(2);
      packet.author = packet.seekStr(packet.authorLength);
      packet.titleLength = packet.seekInt(2);
      packet.title = packet.seekStr(packet.titleLength);
    }
  },
  0xD6: {
    name: 'Mega Cliloc',
    size: 0, // variable
    handle: function(packet) {
      packet.mobileIDs = [];
      while (packet.remaining) {
        packet.mobileIDs.push(packet.seekInt(4));
      }
    }
  },
  0xD7: { // UNFINISHED
    name: 'Generic AOS Commands',
    size: 0, // variable
    handle: function(packet) {
      packet.playerID = packet.seekInt(4);
      packet.subCmd = packet.seekInt(2);
      // subcommand logic here
    }
  },
  0xF1: {
    name: 'Free Shard List',
    size: 0, // variable
    handle: function(packet) {
      packet.subCmd = packet.seekInt(1);
      // subcommand logic here
    }
  }
};
