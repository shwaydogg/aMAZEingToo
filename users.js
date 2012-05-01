//"use strict";

function run(){
    console.log('running USERS');

    // "username:password@example.com/mydb"
    var databaseUrl = (process.env.MONGOHQ_URL ||"localhost:27017")+"/aMAZEingTooDB";
    var collections = ["users", "reports"];
    var db = require("mongojs").connect(databaseUrl, collections);

    var users = {};

    User = function (userData, socket){
        this.socket = socket;
        this.user = userData.user;
        this.wins = userData.wins;
        this.losses = userData.losses;
        this.points = userData.points;
        this.plusMinus = userData.plusMinus;
        users[this.user] = this;
    };

    User.prototype.getWaitingRoom = function (){
        var waitingRoom = {};
        for(var user in users){
            //if user is in the waiting room and is not the current user:
            console.log('users[user]',users[user]);
            if(users[user].waitingRoom && user != this.user){
                console.log("in if");
                waitingRoom[user] = {};
                waitingRoom[user].user = users[user].user;
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
            user:this.user,
            wins:this.wins,
            losses: this.losses,
            points: this.points,
            plusMinus: this.plusMinus
        });
    };

    function userDefaults (login){
        return{ user: login.user,
                password: login.password,
                wins:0,
                losses:0,
                points: 0,
                plusMinus: 0 //like in hockey, point differential
               };
    }

    funcs = {
        login : function (login, socket, callback){
            console.log("in userFuncs.login");
            db.users.find({user: login.user}, function(err, users) {
                console.log("err ", err);
                console.log("users ", users);
                if( err || !users.length){ db.users.save(userDefaults(login), function(err, saved) {
                        if( err || !saved ){
                            callback({success:false, error:"failed: user not found, attempted but failed to save the new user"});
                        }
                        else {
                            new User(userDefaults(login),socket);
                            callback({success:true, newUser:true});
                        }
                    });
                }
                else {
                    if(users[0].password == login.password){
                        new User(users[0],socket);
                        callback({success: true});
                    }
                    else{
                        callback({success:false, error: "badPassword"});
                    }
                }
            });
        },
        sendWaitingRoom: function (user){
            users[user].getWaitingRoom();
        },
        joinWaitingRoom: function (user){
            users[user].joinWaitingRoom();
        }

    };

    return funcs;
}

exports.run = run;