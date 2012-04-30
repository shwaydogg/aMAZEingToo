"use strict";

function setUp(app){
    console.log("setUp express running");
    var files  = "mouseTracks.js canvas.js index.html main.css models.js node_modules/backbone/backbone.js node_modules/mustache/mustache.js node_modules/backbone/node_modules/underscore/underscore.js";
    var toServe = files.split(' ');

    for(var i in toServe){
        (function(){
            var pathToServe = toServe[i];
            app.get('/' + pathToServe, function (req, res) {
                res.sendfile(__dirname + '/'+ pathToServe);
            });
        })();
    }

    app.get('/', function (req, res) {
        res.sendfile(__dirname + '/index.html');
    });

}

exports.setUp = setUp;
