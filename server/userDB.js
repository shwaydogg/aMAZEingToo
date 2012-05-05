function run (){
    // "username:password@example.com/mydb"
    var databaseUrl = (process.env.MONGOHQ_URL ||"localhost:27017")+"/aMAZEingTooDB";
    var collections = ["users", "reports"];
    var db = require("mongojs").connect(databaseUrl, collections);


    loginDB = function (login, defaults, callback){
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
    };
}

exports.run = run;