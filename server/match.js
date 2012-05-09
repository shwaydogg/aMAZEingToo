// "use strict";

function run (io){
    var collision = require('./collision');
    Match = function (user1, user2){
        var self = this;
        this.user1 = user1;
        this.user2 = user2;

        this.gameNumber = 0;
        this.game = {};
        this.game[1] = {mazePath:[],trailPath:[], points1:0, points2:0};

        this.nextGame();
    };


    Match.prototype.nextGame = function (){
        this.gameNumber++;
        this.currentGame = this.game[this.gameNumber];

        if (this.gameNumber == 1){
            this.user1.playerType = 'mazeMaker';
            this.user2.playerType = 'pathFinder';
        }
        else if (this.gameNumber == 2){
            this.currentGame = this.game[1].mazePath;
            this.user1.playerType = 'pathFinder';
            this.user2.playerType = 'watcher';
        }
        else if (this.gameNumber == 3){
            this.user1.playerType = 'pathFinder';
            this.user2.playerType = 'mazeMaker';
        }
        else if (this.gameNumber == 4){
            this.currentGame = this.game[3].mazePath;
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
            opponent: this.user2.history()
        });

        this.user2.socket.emit('initGame', {
            playerType: this.user2.playerType,
            gameNumber: this.gameNumber,
            you: this.user2.history(),
            opponent: this.user1.history()
        });

        this.listen(this.user1);
        this.listen(this.user2);

    };


    Match.prototype.listen = function (user){
        var self = this,
            lineType = (user.playerType == 'pathFinder')? 'trail' : 'maze',
            collisionPath = (lineType == 'maze')? this.currentGame.trailPath : this.currentGame.mazePath,
            addToPath =  (lineType == 'trail')? this.currentGame.trailPath : this.currentGame.mazePath,
            lastValidPoint = null;

            //console.log("lineType:", lineType, " collisionPath:", collisionPath, ' addToPath:', addToPath);


        user.socket.on('sendLine', function (msgData){
            var pointA = lastValidPoint || {x:msgData.line.x1 , y:msgData.line.y1},
                pointB = {x:msgData.line.x2 , y:msgData.line.y2, endLine: msgData.endLine};

            //console.log('senLine:msgData:', msgData);

            if(msgData.gameNumber != self.gameNumber){
                return;
            }

            if( !collision.lineCollide(pointA, pointB, collisionPath)){
                self.drawLine(pointA, pointB, msgData.gameNumber, lineType );
                if (!lastValidPoint){
                    addToPath.push(pointA);
                }
                pointB.end = true;
                addToPath.push(pointB);
                lastValidPoint = (lineType == 'trail')? pointB : null;
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