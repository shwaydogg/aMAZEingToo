var users = require('./users');
var setExpress = require('./setExpress');


var io = require('socket.io'),
	express = require('express');

var app = express.createServer(),
    io = io.listen(app);

app.use(express.bodyParser());


app.listen(8080);

usersFuncs= users.run();
setExpress.setUp(app);


io.sockets.on('connection', function (socket) {

    socket.on('login', function(msgData){
        console.log("msgData",msgData);
        usersFuncs.login(msgData, socket, function(status){
            if(status.success && status.newAccount){
                socket.emit("newAccount");
            } else if(status.success){
                socket.username = msgData.username;
                socket.emit("loggedIn");
            }else{
                socket.emit("badPassword");
            }
        });
    });

    socket.on('getWaitingRoom', function(username){
        usersFuncs.sendWaitingRoom(username);
    });

    socket.on('challenge', function(username){
        console.log('the doomed:', username);
    });

    socket.on('joinWaitingRoom', function(){
        usersFuncs.joinWaitingRoom(socket.username);
        console.log('socket.username', socket.username);
    });
});