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
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
        console.log(data);
    });



    socket.on('login', function(msgData){
        console.log("msgData",msgData);
        var status = usersFuncs.login(msgData, function(status){
            console.log(status);
            if(status.success && status.newAccount){
                socket.emit("newAccount");
            } else if( status.success){
                socket.emit("loggedIn");
            }else{
                socket.emit("badPassword");
            }
        });
    });




});