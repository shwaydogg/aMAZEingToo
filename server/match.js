// "use strict";

function run (io){
    var collision = require('./collision');
    Match = function (user1, user2){
        var self = this;
        this.user1 = user1;
        this.user2 = user2;

        this.canvas = {};
        this.canvas.width = 700;
        this.canvas.height = 400;
        this.doorSize = 10;//entrance and exit square size.

        this.gameNumber = 0;
        this.game = [];


        this.nextGame();
    };

    Match.prototype.checkExit = function (point){
        if (point.x >=this.canvas.width - this.doorSize  &&
            point.y >= this.canvas.height - this.doorSize)
            return true;
        else
            return false;
    };


    Match.prototype.nextGame = function (){
        var self = this;
        this.gameNumber++;
        this.game[this.gameNumber] = {mazePath:[],trailPath:[], points1:0, points2:0};
        this.currentGame = this.game[this.gameNumber];

        console.log("currentGame: ", this.currentGame);


        if (this.gameNumber == 1){
            this.user1.playerType = 'mazeMaker';
            this.user2.playerType = 'pathFinder';
        }
        else if (this.gameNumber == 2){
            this.currentGame.mazePath = this.game[1].mazePath;
            this.user1.playerType = 'pathFinder';
            this.user2.playerType = 'watcher';
        }
        else if (this.gameNumber == 3){
            this.user1.playerType = 'pathFinder';
            this.user2.playerType = 'mazeMaker';
        }
        else if (this.gameNumber == 4){
            this.currentGame.mazePath = this.game[3].mazePath;
            this.user1.playerType = 'watcher';
            this.user2.playerType = 'pathFinder';
        }
        else if (this.gameNumber >= 5 ){
            // Send Game Results
            return;
        }

        this.user1.socket.emit('initGame', {
            playerType: this.user1.playerType,
            gameNumber: this.gameNumber,
            you: this.user1.history(),
            opponent: this.user2.history(),
            canvas: self.canvas
        });

        this.user2.socket.emit('initGame', {
            playerType: this.user2.playerType,
            gameNumber: this.gameNumber,
            you: this.user2.history(),
            opponent: this.user1.history(),
            canvas: self.canvas

        });

        this.listen(this.user1);
        this.listen(this.user2);

    };


    Match.prototype.listen = function (user){
        var self = this,
            gameNumber = this.gameNumber,
            lineType, collisionPath, currentPath, lastValidPoint = null;

        if (user.playerType == 'pathFinder'){
            lineType = 'trail';
            collisionPath = this.currentGame.mazePath;
            currentPath =  this.currentGame.trailPath;
            lastValidPoint = {x:0, y:0};
            currentPath.push(lastValidPoint);
        }else{
            lineType = 'maze';
            collisionPath = this.currentGame.trailPath;
            currentPath =  this.currentGame.mazePath;
        }

        console.log("lineType:", lineType, " collisionPath:", collisionPath, ' currentPath:', currentPath);


        user.socket.on('sendLine', function (msgData){
            var pointA = lastValidPoint || {x:msgData.line.x1 , y:msgData.line.y1},
                pointB = {x:msgData.line.x2 , y:msgData.line.y2};

            //console.log('sendLine:msgData:', msgData);
            // console.log('lineType', lineType);

            if(gameNumber != self.gameNumber ||
                msgData.gameNumber != self.gameNumber){
                return;
            }

            if( !collision.lineCollide(pointA, pointB, collisionPath)){
                self.drawLine(pointA, pointB, msgData.gameNumber, lineType );
                if (!lastValidPoint){
                    currentPath.push(pointA);
                }
                pointB.end = (lineType == 'maze')? true : false;
                currentPath.push(pointB);
                lastValidPoint = (lineType == 'trail')? pointB : null;
                if (lineType == 'trail' && self.checkExit(pointB)){
                    io.sockets.in(this.room).emit('mazeComplete');
                    self.nextGame();
                    //return;
                }
            }
            else{
                //console.log('collision detected');
                user.socket.emit('collision',{pointA:pointA, pointB:pointB});
                //there was collision, points should be decremented.
            }
        });
    };

    Match.prototype.drawLine = function (pointA, pointB, gameNumber ,type){
        var line = {x1:pointA.x, y1:pointA.y, x2:pointB.x, y2:pointB.y};
        io.sockets.in(this.room).emit('drawLine',{line:line, gameNumber:gameNumber, type:type});
    };

    Match.prototype.isCollision = function(line, type){
        var path = (type == 'maze')? this.currentGame.trailPath : this.currentGame.mazePath;

        if( lineCollide({x1:line.x1,y1:line.y1},{x2:line.x2, y2:line.y2}, path)){
            return true;
        }

        return false;
    };
}


exports.run = run;