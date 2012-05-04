var users = require('./users');
var setExpress = require('./server/setExpress');


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
                socket.user = msgData.user;
                socket.emit("loggedIn");
            }else{
                socket.emit("badPassword");
            }
        });
    });

    socket.on('getWaitingRoom', function(user){
        usersFuncs.sendWaitingRoom(user);
    });

    socket.on('challenge', function(user){
        console.log('the doomed:',user);
    });

    socket.on('joinWaitingRoom', function(){
        usersFuncs.joinWaitingRoom(socket.user);
        console.log('socket.user', socket.user);
    });
});