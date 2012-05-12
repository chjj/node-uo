/**
 * Utils
 */

var assert = function(v) {
  if (!v) throw new Error('Assertion failure.');
};

var slice = [].slice;

// converts a buffer into a utf8 string
// NUL terminated
var bytesToStr = function(buff) {
  var l = buff.length
    , i = 0;

  if (Array.isArray(buff)) {
    buff = new Buffer(buff);
  }

  for (; i < l; i++) {
    if (buff[i] === 0x00) break;
  }

  return buff.toString('utf8', 0, i);
};

assert(bytesToStr(new Buffer('hello world\0\0\0')) === 'hello world');

exports.bytesToStr = bytesToStr;

// e.g. turn [0x01, 0x10] into 272
var bytesToInt = function(buff) {
  var l = buff.length
    , i = 0
    , j = 0;

  for (; i < l; i++) {
    j = (j << 8) | buff[i];
  }

  return j;
};

assert(bytesToInt(new Buffer([0x01, 0x10])) === 272);

exports.bytesToInt = bytesToInt;

// e.g. turn 0 into '0x00'
var intToHexStr = function(n) {
  n = n.toString(16).toUpperCase();
  if (n.length % 2 !== 0) {
    n = '0' + '' + n;
  }
  return '0x' + n;
};

assert(intToHexStr(0) === '0x00');

exports.intToHexStr = intToHexStr;

// e.g. turn [0x01, 0x10] into 0x0110
var bytesToHexStr = function(buff) {
  return intToHexStr(bytesToInt(buff));
};

assert(bytesToHexStr(new Buffer([0x01, 0x10])) === '0x0110');

exports.bytesToHexStr = bytesToHexStr;

// NUL terminated if length is specified
var strToBytes =  function(str, len) {
  var buff = new Buffer(len);

  buff.write(str);

  var i = Buffer.byteLength(str);
  for (; i < len; i++) {
    buff[i] = 0;
  }

  // bad
  // if (buff[buff.length-1] !== 0) {
  //   buff[buff.length-1] = 0;
  // }

  return buff;
};

var r = strToBytes('hello', 10);
assert(r[4] === 'o'.charCodeAt(0));
assert(r[5] === 0);

exports.strToBytes = strToBytes;

// BE, number of bytes can be specified
var intToBytes = function(n, len) {
  var len = len || 8
    , buff = new Buffer(len)
    , i = 0
    , j;

  for (; i < len; i++) {
    j = len - 1 - i;
    buff[i] = (n >> (j * 8)) & 0xFF;
  }

  return slice.call(buff);
};

// BE, number of bytes can be specified
var intToBytes = function(n, len) {
  var buff = []
    , i = 8
    , j;

  while (i--) {
    buff.push((n >> (i * 8)) & 0xFF);
  }

  if (len) {
    while (buff.length > len) buff.shift();
  }

  return buff;
};

var r = intToBytes(0x0110, 4);
assert(r[0] === 0x00);
assert(r[1] === 0x00);
assert(r[2] === 0x01);
assert(r[3] === 0x10);
assert(r.length === 4);

exports.intToBytes = intToBytes;
