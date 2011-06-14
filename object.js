
var Player = function(socket, name, password) {
  if (!(this instanceof Player)) {
    return new Player(socket, name, password);
  }
  this.socket = socket;
  this.name = name;
  this.password = password;
  this.state = 'LOGIN';
  this.character = null;
};

Player.authenticated = function(socket, account) {
  socket.player = new Player(socket, account.name, account.password);
};

exports.Player = Player;