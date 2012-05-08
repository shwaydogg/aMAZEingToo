// "use strict";

function isCollision (){
	return false;
}

function run (io){

	Match = function (user1, user2){
		var self = this;
		this.user1 = user1;
		this.user2 = user2;

		this.gameNumber = 0;
		this.game1 = {mazePath:[],trailPath:[], points1:0, points2:0};

		this.nextGame();
	};


	Match.prototype.nextGame = function (){
		this.gameNumber++;
		if (this.gameNumber == 1){
			this.user1.playerType = 'mazeMaker';
			this.user2.playerType = 'pathFinder';
		}
		else if (this.gameNumber == 2){
			this.user1.playerType = 'pathFinder';
			this.user2.playerType = 'watcher';
		}
		else if (this.gameNumber == 3){
			this.user1.playerType = 'pathFinder';
			this.user2.playerType = 'mazeMaker';
		}
		else if (this.gameNumber == 4){
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
		var self = this;
		var lineType;
		user.socket.on('sendLine', function (msgData){
			console.log('sendline', msgData);
			if(msgData.gameNumber != self.gameNumber){
				return;
			}
			lineType = (user.playerType == 'pathFinder')? 'path' : 'maze';
			self.drawLine(msgData.line, msgData.gameNumber, lineType);
		});
	};

	Match.prototype.drawLine = function (line, gameNumber ,type){
		io.sockets.in(this.room).emit('drawLine',{line:line, gameNumber:gameNumber, type:type});
	};

}

exports.run = run;