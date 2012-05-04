// "use strict";

function setUp(app){
    console.log("setUp express running");
    var toServe  = [
        "client/backbone/router.js",
        "client/backbone/login.js",
        "client/backbone/game.js",
        "client/mouseTracks.js",
        "client/canvas.js",
        "client/index.html",
        "client/main.css",
        "node_modules/backbone/backbone.js",
        "node_modules/mustache/mustache.js",
        "node_modules/backbone/node_modules/underscore/underscore.js"
                    ];

    for(var i in toServe){
        (function(){
            var pathToServe = toServe[i];
            var root = __dirname;
            root = root.replace("server",'');
            app.get('/' + pathToServe, function (req, res) {
                res.sendfile(root + pathToServe);
            });
        })();
    }

    app.get('/', function (req, res) {
        var root = __dirname;
        root = root.replace("server",'');
        res.sendfile(root + 'client/index.html');
    });

}

exports.setUp = setUp;
