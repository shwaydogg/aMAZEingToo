//"use strict";

function run(){
    console.log('running USERS');

    // "username:password@example.com/mydb"
    var databaseUrl = (process.env.MONGOHQ_URL ||"localhost:27017")+"/aMAZEingTooDB";
    var collections = ["users", "reports"];
    var db = require("mongojs").connect(databaseUrl, collections);

    funcs = {
        login : function (login, callback){
            console.log("in userFuncs.login");
            db.users.find({user: login.user}, function(err, users) {
                console.log("err ", err);
                console.log("users ", users);
                if( err || !users.length){ db.users.save({
                                            user: login.user,
                                            password: login.password,
                                            wins:0,
                                            losses:0,
                                            points: 0,
                                            plusMinus: 0 //like in hockey, point differential
                                        }, function(err, saved) {
                        if( err || !saved ){
                            callback({success:false, error:"failed: user not found, attempted but failed to save the new user"});
                        }
                        else {
                            callback({success:true, newUser:true});
                        }
                    });
                }
                else {
                    if(users[0].password == login.password){
                        callback({success: true});
                    }
                    else{
                        callback({success:false, error: "badPassword"});
                    }
                }
            });
        }
    };

    return funcs;
}

exports.run = run;