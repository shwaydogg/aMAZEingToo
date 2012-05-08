var users = require('./users');
var match = require('./match.js');
var setExpress = require('./setExpress');


var io = require('socket.io'),
	express = require('express');

var app = express.createServer(),
    io = io.listen(app);

app.use(express.bodyParser());


app.listen(8080);

users.run();
match.run(io);
setExpress.setUp(app);


io.sockets.on('connection', function (socket) {
    new User(socket);
});