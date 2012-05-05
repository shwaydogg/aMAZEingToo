//"use strict";

function run(){
    console.log('running USERS');

    // "username:password@example.com/mydb"
    var databaseUrl = (process.env.MONGOHQ_URL ||"localhost:27017")+"/aMAZEingTooDB";
    var collections = ["users", "reports"];
    var db = require("mongojs").connect(databaseUrl, collections);

    var users = {};

    function loginDB (login, defaults, callback){
        var user;
        console.log("in userFuncs.login");
        db.users.find({username: login.username}, function(err, users) {
            console.log("err ", err);
            console.log("users ", users);
            if( err || !users.length){
                db.users.save(defaults, function(err, saved) {
                    if( err || !saved ){
                        callback({success:false, error:"failed: user not found, attempted but failed to save the new user"});
                    }
                    else {
                        callback({success:true, newUser:true, userData:defaults});
                    }
                });
            }
            else {
                if(users[0].password == login.password){
                    callback({success: true, userData:users[0]});
                }
                else{
                    callback({success:false, error: "badPassword"});
                }
            }
        });
    }

    User = function(socket){
        this.socket = socket;
        this.login();
        this.socket.on('login', function(msgData){});
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
        });

    };

    User.prototype.getWaitingRoom = function (){
        var waitingRoom = {};
        for(var user in users){
            //if user is in the waiting room and is not the current user:
            console.log('users[user]',users[user]);
            if(users[user].waitingRoom && user != this.user){
                console.log("in if");
                waitingRoom[user] = {};
                waitingRoom[user].username = users[user].username;
                waitingRoom[user].wins = users[user].wins;
                waitingRoom[user].losses = users[user].losses;
                waitingRoom[user].points = users[user].points;
                waitingRoom[user].plusMinus = users[user].plusMinus;
            }
        }
        console.log("WR",waitingRoom);
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
}

exports.run = run;