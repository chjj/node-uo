var fs = require('fs')
  , path = require('path')
  , slice = [].slice;

// load the string db into memory
var sdb = fs.readFileSync('./sdb.txt.q', 'utf-8').split(/\r?\n/);

// bad
var big = function() {
  var ints = slice.call(arguments)
    , len = ints.length
    , hex = ''
    , ch;
  
  while (len--) {
    ch = ints[len].toString(16);
    if (ch.length < 2) ch = '0' + ch;
    hex += ch;
  }
  
  return parseInt('0x' + hex, 16);
};

// get int ready for parseint, bad
var hex = function(n, l) {
  l = (l || 2) * 2;
  n = (+n).toString(16);
  while (n.length < l) n = '0' + n;
  return '0x' + n;
};

// lookup table for deobfuscation
var lookup = {
  0x390C: 0x02, 0x0F3E: 0x02, 0x0199: 0x02, 0x0124: 0x02, 0x305E: 0x02,
  0x39B3: 0x03, 0x2D12: 0x03, 0x26A6: 0x03, 0x5D03: 0x03, 0x1238: 0x03,
  0x3B25: 0x04, 0x1E1F: 0x04, 0x1AD4: 0x04, 0x7F96: 0x04, 0x7FF5: 0x04,
  0x0732: 0x06, 0x0120: 0x06, 0x5CFD: 0x06, 0x3E12: 0x06, 0x3BF6: 0x06,
  0x3A9E: 0x07, 0x0DDC: 0x07, 0x5E14: 0x07, 0x2E40: 0x07, 0x1CD0: 0x07,
  0x7EB7: 0x08, 0x6032: 0x08, 0x2C3B: 0x08, 0x15A1: 0x08, 0x3EF6: 0x08,
  0x409D: 0x09, 0x12E1: 0x09, 0x121F: 0x09, 0x26CA: 0x09, 0x3699: 0x09,
  0x0902: 0x0A, 0x7BB9: 0x0A, 0x139D: 0x0A, 0x187E: 0x0A, 0x16C5: 0x0A,
  0x3CD5: 0x0B, 0x13E9: 0x0B, 0x4080: 0x0B, 0x5DB2: 0x0B, 0x33EA: 0x0B,
  0x23C9: 0x0C, 0x60BF: 0x0C, 0x3CD6: 0x0C, 0x0FBF: 0x0C, 0x2F14: 0x0C,
  0x047E: 0x0D, 0x368E: 0x0D, 0x2FFF: 0x0D, 0x288F: 0x0D, 0x7DD1: 0x0D,
  0x261E: 0x0E, 0x5E9D: 0x0E, 0x1916: 0x0E, 0x32E6: 0x0E, 0x401D: 0x0E,
  0x0384: 0x0F, 0x18D7: 0x0F, 0x0FC9: 0x0F, 0x0E12: 0x0F, 0x2833: 0x0F,
  0x249E: 0x10, 0x2B0C: 0x10, 0x11F4: 0x10, 0x5DD5: 0x10, 0x127E: 0x10,
  0x0135: 0x11, 0x07CF: 0x11, 0x1AF4: 0x11, 0x0ECC: 0x11, 0x01D3: 0x11,
  0x0E90: 0x12, 0x3A2D: 0x12, 0x37E6: 0x12, 0x19D9: 0x12, 0x252A: 0x12,
  0x37E5: 0x13, 0x1DC0: 0x13, 0x1481: 0x13, 0x4087: 0x13, 0x2B01: 0x13,
  0x16D4: 0x14, 0x3A8D: 0x14, 0x7FBE: 0x14, 0x0C7B: 0x14, 0x0C15: 0x14,
  0x3807: 0x15, 0x0633: 0x15, 0x251F: 0x15, 0x1D18: 0x15, 0x3492: 0x15,
  0x19DA: 0x16, 0x39CE: 0x16, 0x3BB1: 0x16, 0x3004: 0x16, 0x1796: 0x16,
  0x1F16: 0x17, 0x182F: 0x17, 0x2CF7: 0x17, 0x5ED0: 0x17, 0x1316: 0x17,
  0x5D24: 0x18, 0x0588: 0x18, 0x7CFE: 0x18, 0x2725: 0x18, 0x0DE5: 0x18,
  0x13D3: 0x19, 0x29D8: 0x19, 0x0A28: 0x19, 0x09CE: 0x19, 0x3960: 0x19,
  0x5CCD: 0x1B, 0x0940: 0x1B, 0x293B: 0x1B, 0x40A5: 0x1B, 0x1D11: 0x1B,
  0x2528: 0x1C, 0x0EA9: 0x1C, 0x3F0B: 0x1C, 0x3087: 0x1C, 0x3F97: 0x1C,
  0x30F1: 0x1D, 0x3295: 0x1D, 0x01C1: 0x1D, 0x0CE1: 0x1D, 0x3EE9: 0x1D,
  0x3F9A: 0x1E, 0x30A7: 0x1E, 0x2DB5: 0x1E, 0x169A: 0x1E, 0x2FE7: 0x1E,
  0x10D9: 0x1F, 0x0390: 0x1F, 0x2A38: 0x1F, 0x0728: 0x1F, 0x5C5E: 0x1F,
  0x01E1: 0x20, 0x1030: 0x20, 0x1BD9: 0x20, 0x159F: 0x20, 0x2BA5: 0x20,
  0x28E2: 0x21, 0x2F0C: 0x21, 0x1289: 0x21, 0x3382: 0x21, 0x36C2: 0x21,
  0x26B1: 0x22, 0x1CDF: 0x22, 0x27DA: 0x22, 0x0E29: 0x22, 0x113E: 0x22,
  0x2E39: 0x23, 0x1D3F: 0x23, 0x1D5E: 0x23, 0x1FF1: 0x23, 0x7E0E: 0x23,
  0x12C2: 0x25, 0x1003: 0x25, 0x0607: 0x25, 0x0784: 0x25, 0x2B0F: 0x25,
  0x3305: 0x26, 0x32E7: 0x26, 0x212C: 0x26, 0x018E: 0x26, 0x3308: 0x26,
  0x3106: 0x28, 0x018C: 0x28, 0x357E: 0x28, 0x0A87: 0x28, 0x5D2B: 0x28,
  0x7DAA: 0x2A, 0x2F0B: 0x2A, 0x1BFC: 0x2A, 0x13F5: 0x2A, 0x1ECA: 0x2A,
  0x017B: 0x2C, 0x6014: 0x2C, 0x0E99: 0x2C, 0x33CD: 0x2C, 0x27D3: 0x2C,
  0x7F0D: 0x2D, 0x04F0: 0x2D, 0x183A: 0x2D, 0x1FB4: 0x2D, 0x13A6: 0x2D,
  0x04B0: 0x2F, 0x1927: 0x2F, 0x08FF: 0x2F, 0x31D8: 0x2F, 0x0914: 0x2F,
  0x3223: 0x31, 0x17B8: 0x31, 0x3895: 0x31, 0x248D: 0x31, 0x342D: 0x31,
  0x5D3D: 0x32, 0x3260: 0x32, 0x32DE: 0x32, 0x2780: 0x32, 0x31AD: 0x32,
  0x5DE9: 0x33, 0x5EA5: 0x33, 0x11D5: 0x33, 0x199F: 0x33, 0x2F15: 0x33,
  0x0E01: 0x34, 0x19FE: 0x34, 0x3821: 0x34, 0x0B93: 0x34, 0x0A2F: 0x34,
  0x09B3: 0x35, 0x038F: 0x35, 0x328A: 0x35, 0x08AF: 0x35, 0x5CCA: 0x35,
  0x0C95: 0x36, 0x7CBE: 0x36, 0x7C27: 0x36, 0x5D2A: 0x36, 0x2FA1: 0x36,
  0x31BE: 0x37, 0x15B4: 0x37, 0x07C9: 0x37, 0x27C0: 0x37, 0x1B32: 0x37,
  0x2934: 0x38, 0x3E09: 0x38, 0x012C: 0x38, 0x2CC6: 0x38, 0x7FA6: 0x38,
  0x5D17: 0x3A, 0x0A1D: 0x3A, 0x3B29: 0x3A, 0x2BFA: 0x3A, 0x2BB8: 0x3A,
  0x17BD: 0x3C, 0x21EB: 0x3C, 0x2015: 0x3C, 0x5DB8: 0x3C, 0x15E1: 0x3C,
  0x5B60: 0x3D, 0x3D8F: 0x3D, 0x0FF4: 0x3D, 0x275B: 0x3D, 0x3C8A: 0x3D,
  0x188F: 0x3E, 0x5D27: 0x3E, 0x7F5C: 0x3E, 0x01F7: 0x3E, 0x093B: 0x3E,
  0x3510: 0x41, 0x0B9B: 0x41, 0x06E9: 0x41, 0x3B9E: 0x41, 0x0B31: 0x41,
  // unused
  0x263D: 0x1A, 0x3B97: 0x1A, 0x4027: 0x1A, 0x138A: 0x1A, 0x282D: 0x1A,
  // defined-unsupported
  0x1EDC: 0x27, 0x20A8: 0x27, 0x37BE: 0x27, 0x01EB: 0x27, 0x123B: 0x27,
  0x03FA: 0x29, 0x0AF0: 0x29, 0x0786: 0x29, 0x2332: 0x29, 0x1295: 0x29,
  0x0D9F: 0x2B, 0x388A: 0x2B, 0x15FD: 0x2B, 0x7CB8: 0x2B, 0x1AF6: 0x2B,
  0x190B: 0x2E, 0x3605: 0x2E, 0x20AD: 0x2E, 0x32CF: 0x2E, 0x2CD5: 0x2E,
  0x13F4: 0x30, 0x3A27: 0x30, 0x387C: 0x30, 0x32C1: 0x30, 0x198C: 0x30,
  // obfuscated-unsupported
  0x0BB3: 0x01, 0x2EA6: 0x01, 0x12DB: 0x01, 0x153C: 0x01, 0x7E87: 0x01,
  0x323B: 0x05, 0x260D: 0x05, 0x030A: 0x05, 0x301C: 0x05, 0x0BDB: 0x05,
  0x06E3: 0x24, 0x36A1: 0x24, 0x0C1E: 0x24, 0x2120: 0x24, 0x1DCB: 0x24,
  0x06D8: 0x39, 0x3181: 0x39, 0x2738: 0x39, 0x3212: 0x39, 0x03F9: 0x39,
  0x1DB5: 0x3B, 0x2F95: 0x3B, 0x0EF5: 0x3B, 0x5CDF: 0x3B, 0x7B8B: 0x3B,
  0x2F84: 0x3F, 0x1DC3: 0x3F, 0x1DA7: 0x3F, 0x1A30: 0x3F, 0x2410: 0x3F,
  0x02EE: 0x40, 0x0603: 0x40, 0x012F: 0x40, 0x2C9E: 0x40, 0x2BEF: 0x40
};

// byte code -> tokens
var tokens = {
  0x02: '(',
  0x03: ')',
  0x04: ',',
  0x06: ';',
  0x07: '{',
  0x08: '}',
  0x09: '[',
  0x0A: ']',
  0x0B: '!',
  0x0C: '+',
  0x0D: '-',
  0x0E: '*',
  0x0F: '/',
  0x10: '%',
  0x11: '==',
  0x12: '!=',
  0x13: '<',
  0x14: '>',
  0x15: '<=',
  0x16: '>=',
  0x17: '=',
  0x18: '&&',
  0x19: '||',
  0x1B: '++',
  0x1C: '--',
  0x1D: 'integer',   // int, integer
  0x1E: 'string',    // str, string
  0x1F: 'ust',       // ust, ?
  0x20: 'location',  // loc, location (x, y, z)
  0x21: 'object',    // obj, object
  0x22: 'list',      // lis, list
  0x23: 'void',      // voi, void
  0x25: 'if',
  0x26: 'else',
  0x28: 'while',
  0x2A: 'for',
  0x2C: 'continue',
  0x2D: 'break',
  0x2F: 'switch',
  0x31: 'case',
  0x32: 'default',
  0x33: 'return',
  0x34: 'function', // declares a function and defines the implementation
  0x35: 'on',       // "on event" statement
  0x36: 'var',      // variable declaration (scriptvar)
  0x37: 'include',  // include script
  0x38: 'extern',   // declares a c-like function prototype
  
  // these wont have key words associated 
  // with them, theyre simply bytecode markers
  0x3A: 'QUOTED_STRING',
  0x3C: 'CONSTANT_BYTE',
  0x3D: 'CONSTANT_WORD',
  0x3E: 'CONSTANT_DWORD',
  0x41: 'STRING',
  
  // unused
  0x1A: '^',
  
  // defined-unsupported
  0x27: 'ENDIF',
  0x29: 'ENDWHILE',
  0x2B: 'ENDFOR',
  0x2E: 'GOTO',
  0x30: 'ENDSWITCH',
  
  // obfuscated-unsupported
  0x01: '',
  0x05: '',
  0x24: '',
  0x39: '',
  0x3B: '',
  0x3F: '',
  0x40: ''
};

// reverse lookups
var _tokens = {}
  , _lookup = {};

(function() {
  for (var k in tokens) {
    _tokens[tokens[k]] = k;
  }
  for (var k in lookup) {
    _lookup[lookup[k]] = k;
  }
})();

// support for the hardcoded event arguments
var events = { 
  'speech': '(object speaker, string arg)',
  'gotattacked': '(object attacker)',
  'killedtarget': '(object attacker)',
  'aversion': '(object target)',
  'death': '(object attacker, object corpse)',
  'sawdeath': '(object attacker, object victim, object corpse)',
  'fightpulse': '(object target)',
  'washit': '(object attacker, integer damamt)',
  'failfood': '()',
  'faildesire': '()',
  'failshelter': '()',
  'foundfood': '(object target)',
  'founddesire': '(object target)',
  'foundshelter': '(object target)',
  'time': '()',
  'creation': '()',
  'enterrange': '(object target)',
  'leaverange': '(object target)',
  'loiter': '()',
  'seekfood': '()',
  'seekdesire': '()',
  'seekshelter': '()',
  'message': '(object sender, list args)',
  'use': '(object user)',
  'targetobj': '(object user, object usedon)',
  'targetloc': '(object user, location usedon, integer objtype)',
  'weather': '()',
  'wasdropped': '(object dropper)',
  'lookedat': '(object looker)',
  'give': '(object giver, object givenobj)',
  'wasgotten': '(object getter)',
  'pathfound': '()',
  'pathnotfound': '()',
  'callback': '()',
  'ishitting': '(object victim, integer damamt)',
  'convofunc': '(object talker, string arg)',
  'typeselected': '(object user, integer listindex, integer objtype, integer objhue)',
  'hueselected': '(object user, integer objhue)',
  'moon': '(integer trammelchange, integer feluccachange)',
  'minrangeattack': '(object defender)',
  'minrangedefend': '(object attacker)',
  'maxrangeattack': '(object defender)',
  'maxrangedefend': '(object attacker)',
  'destroyed': '()',
  'equip': '(object equippedon)',
  'unequip': '(object unequippedfrom)',
  'isstackableon': '(object stackon)',
  'stackonto': '(object stackon)',
  'multirecycle': '(integer oldtype, integer newtype)',
  'decay': '(integer oldvalue, integer newvalue)',
  'serverswitch': '()',
  'ooruse': '(object user)',
  'acquiredesire': '(object target)',
  'logout': '()',
  'objectloaded': '()',
  'genericgump': '(object user, integer closeId, list selectList, list entryList)',
  'oortargetobj': '(object user, object usedon)',
  'pkpost': '(object killer, object killee)',
  'textentry': '(object sender, integer button, string text)',
  'shop': '(integer func)',
  'stolenfrom': '(object stealer)',
  'objaccess': '(object user, object usedon)',
  'ishealthy': '()',
  'online': '()',
  'transaccountcheck': '(object target, integer transok)',
  'transresponse': '(object target, integer transok)',
  'canbuy': '(object buyer, object seller, integer quantity)',
  'mobishitting': '(object victim, integer damage)',
  'famechanged': '()',
  'karmachanged': '()',
  'murdercountchanged': '()'
};

// curry event arguments on
var curry = function(str) {
  return str.replace(/on\s+(\w+)[^{]+{[ \t]*(?=\n)/g, function($0, $1) {
    if (!events[$1]) return $0;
    return '/* ' + events[$1] + ' */\n' + $0;
  });
};

// strip all comments
var decomment = function(str) {
  return str.replace(/\/\/[^\n]+|\/\*[\s\S]+?\*\//g, '');
};

// for the tokenizer
var rules = (function() {
  var rules = {};
  
  var escape = function(str) {
    return str.replace(/([+*?\-.^$(){}\\|\[\]])/g, '\\$1');
  };
  
  // in order of operator precedence
  ['(',
   ')',
   ',',
   ';',
   '{',
   '}',
   '[',
   ']',
   '++',
   '--',
   '!',
   '+',
   '-',
   '*',
   '/',
   '%',
   '==',
   '!=',
   '<=',
   '>=',
   '<',
   '>',
   '=',
   '&&',
   '||',
   '^'].forEach(function(tok) {
    rules[tok] = new RegExp('^' + escape(tok));
  });
  
  rules.QUOTED_STRING = /^"([^"]|\\")*"/;    // 0x3A
  rules.CONSTANT_DWORD = /^0x[a-f0-9]{8}/i;  // 0x3E
  rules.CONSTANT_WORD = /^0x[a-f0-9]{4}/i;   // 0x3D
  rules.CONSTANT_BYTE = /^0x[a-f0-9]{2}/i;   // 0x3C
  rules.STRING = /^\w+/;                     // 0x41
  rules.WHITESPACE = /^\s+/;
  
  return rules;
})();

// decompile a single file
var decompile = function(data) {
  var len = data.length - 1
    , i = 0
    , out = ''
    , ch
    , word
    , token
    , val
    , depth = 0;
  
  // this is a huge hack to get the whitespace right
  var prev = function() {
    var a = data[i-5], b = data[i-4]; 
    return a && b && tokens[lookup[big(a, b)]];
  };
  var peek = function() {
    var a = data[i], b = data[i+1];
    return a && b && tokens[lookup[big(a, b)]];
  };
  
  // whitespace: there are a few special exceptions 
  // that are handled here. specifically, "else".
  var whitespace = function(out) { 
    if (token === '{') out = ' ' + out;
    else if (token === '}') out += ' ';
    if (token === '{' 
        || token === '}' 
        || token === ';') {
      if (token === '{') depth++;
      if (peek() === '}') depth--;
      if (!(token === '}' && peek() === 'else')) {
        out += '\n';
        out += Array(depth + 1).join('  ');
      }
    } 
    if (ch >= 0x0C && ch <= 0x1C) out = ' ' + out + ' ';
    else if ((ch >= 0x1D && ch <= 0x38) 
              || token === ',') 
                if (token !== 'else' 
                    && token !== 'break') out += ' ';
    return out;
  };
  
  while (i < len) {
    // need to convert 
    word = big(data[i++], data[i++]);
    
    // deobfuscate
    ch = lookup[word];
    
    // get the readable token
    token = tokens[ch];
    
    switch (token) {
      case 'STRING':
      case 'QUOTED_STRING':
        val = big(data[i++], data[i++]);
        out += sdb[val];
        break;
      case 'CONSTANT_BYTE':
        out += hex(data[i++], 1);
        break;
      case 'CONSTANT_WORD':
        val = big(data[i++], data[i++]);
        out += hex(val, 2);
        break;
      case 'CONSTANT_DWORD': 
        val = big(data[i++], data[i++], data[i++], data[i++]);
        out += hex(val, 4);
        break;
      default:
        out += whitespace(token);
    }
    
    // HACK
    if (prev() === 'case') {
      out += '\n';
      out += Array(depth + 1).join('  ');
    }
    
    // lookbehind.unshift(token);
    // lookbehind.pop();
  }
  
  // curry on event args
  out = curry(out);
  
  return out;
};

decompile.file = function(file) {
  var out = decompile(fs.readFileSync(file));
  file = file.replace('.q', '.uosl');
  fs.writeFileSync(file, out);
};

decompile.mass = function(root) {
  fs.readdirSync(root).forEach(function(file) {
    if (file.slice(-2) !== '.q') return;
    decompile.file(path.join(root, file));
  });
};

// parse and compile a string, return a buffer
var compile = function(str) {
  var len = str.length
    , out = new Buffer(Buffer.byteLength(str) * 3)
    , i = 0
    , k = 0
    , key
    , keys = Object.keys(rules)
    , rule
    , cap;
  
  str = decomment(str);
  
  while (str.length) {
    key = keys[k++];
    rule = rules[key];
    if (cap = rule.exec(str)) {
      k = 0;
      cap = cap[0];
      str = str.substring(cap.length);
      if (key !== 'WHITESPACE') {
        if (key === 'STRING' && _tokens[cap]) {
          key = cap;
        }
        val = hex(_lookup[_tokens[key]], 2);
        val = val.substring(2);
        val = val.match(/[a-f0-9]{2}/gi);
        out[i++] = parseInt(val[1], 16);
        out[i++] = parseInt(val[0], 16);
      }
      switch (key) {
        case 'WHITESPACE': 
          break;
        case 'STRING':
        case 'QUOTED_STRING':
          val = hex(sdb.indexOf(cap), 2);
          val = val.substring(2);
          val = val.match(/[a-f0-9]{2}/gi);
          out[i++] = parseInt(val[1], 16);
          out[i++] = parseInt(val[0], 16);
          break;
        case 'CONSTANT_BYTE':
          out[i++] = parseInt(cap, 16);
          break;
        case 'CONSTANT_WORD':
          cap = cap.substring(2);
          cap = cap.match(/[a-f0-9]{2}/gi);
          out[i++] = parseInt(cap[1], 16);
          out[i++] = parseInt(cap[0], 16);
          break;
        case 'CONSTANT_DWORD':
          cap = cap.substring(2);
          cap = cap.match(/[a-f0-9]{2}/gi);
          out[i++] = parseInt(cap[3], 16);
          out[i++] = parseInt(cap[2], 16);
          out[i++] = parseInt(cap[1], 16);
          out[i++] = parseInt(cap[0], 16);
          break;
        default: break;
      }
    }
  }
  
  return out.slice(0, i);
};

compile.file = function(file) {
  var out = compile(fs.readFileSync(file, 'utf-8'));
  file = file.replace('.uosl', '.q');
  fs.writeFileSync(file, out);
};

compile.mass = function(root) {
  fs.readdirSync(root).forEach(function(file) {
    if (file.slice(-5) !== '.uosl') return;
    compile.file(path.join(root, file));
  });
};

// # usage: ./uosl .rundir/scripts --decompile

var main = function(argv) {
  var com = argv.indexOf('--compile')
    , dec = argv.indexOf('--decompile')
    , root
    , start
    , data;
  
  if (!~com) com = argv.indexOf('-c');
  if (!~dec) dec = argv.indexOf('-d');
  
  if (~com) argv.splice(com, 1);
  if (~dec) argv.splice(dec, 1);
  
  com = !!~com;
  dec = !!~dec;
  root = argv.pop();
  
  start = Date.now();
  if (com) {
    if (fs.statSync(root).isDirectory()) {
      compile.mass(root);
    } else {
      compile.file(root);
    }
  } else {
    if (fs.statSync(root).isDirectory()) {
      decompile.mass(root);
    } else {
      decompile.file(root);
    }
  }
  console.log(
    '%s completed in %sms.', 
    com ? 'Compilation' 
        : 'Decompilation', 
    Date.now() - start
  );
};

if (!module.parent) {
  if (process.argv.indexOf('--test')) {
    // test a file
    var data = fs.readFileSync('./build.m.q');
    fs.writeFileSync('./mine.m.c', decompile(compile(decompile(data))));
  } else {
    main(process.argv.slice());
  }
} else {
  exports.compile = compile;
  exports.decompile = decompile;
}