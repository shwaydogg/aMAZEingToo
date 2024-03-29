//"use strict";

function run (){
    require('./userDB').run();

    var users = {};


    User = function(socket){
        this.socket = socket;
        this.login();
    };

    User.prototype.login = function (){
        var self = this;

        self.socket.on('login', function(credentials){
            console.log("msgData",credentials);
            loginDB(credentials, userDefaults(credentials), function(status){
                if(status.success){
                    self.postLogin(status.userData);
                    if(status.newAccount){
                        self.socket.emit("newAccount");
                    } else{
                        self.socket.emit("loggedIn");
                    }
                }else{
                    self.socket.emit("badPassword");
                }
            });
        });
    };

    User.prototype.postLogin = function (userData){
        var self = this;
        this.username = userData.username;
        this.wins = userData.wins;
        this.losses = userData.losses;
        this.points = userData.points;
        this.plusMinus = userData.plusMinus;
        users[this.username] = this;

        this.socket.on('getWaitingRoom', function(username){
            self.getWaitingRoom();
        });

        this.socket.on('joinWaitingRoom', function(){
            self.joinWaitingRoom();
            console.log('socket.username', self.socket.username);
        });

        this.socket.on('challenge', function(username){
            console.log('the doomed:', self.username);
            self.startMatch(username);
        });

    };

    User.prototype.history = function (){
        return {
                    username:this.username,
                    wins : this.wins,
                    losses : this.losses,
                    points : this.points,
                    plusMinus : this.plusMinus
                };
    };

    User.prototype.getWaitingRoom = function (){
        var waitingRoom = {};
        for(var user in users){
            //if user is in the waiting room and is not the current user:
            if(users[user].waitingRoom && user != this.user){
                waitingRoom[user] = users[user].history();
            }
        }
        this.socket.emit("waitingRoom", waitingRoom);
    };

    User.prototype.joinWaitingRoom = function () {
        this.waitingRoom = true;
        this.socket.broadcast.emit('newOpponent',{
            username:this.username,
            wins:this.wins,
            losses: this.losses,
            points: this.points,
            plusMinus: this.plusMinus
        });
    };

    function userDefaults (login){
        return{ username: login.username,
                password: login.password,
                wins:0,
                losses:0,
                points: 0,
                plusMinus: 0 //like in hockey, point differential
               };
    }

    User.prototype.startMatch = function (challenged){
        if(this.inMatch){
            this.socket.emit('you are already in a game');
        }
        else if (users[challenged].inMatch){
            this.socket.emit('they are already in a game');
        }
        else{
            this.inMatch = true;
            users[challenged].inMatch = true;
            new Match(this, users[challenged]);
        }
    };
}

exports.run = run;