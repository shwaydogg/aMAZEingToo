// "use strict";

function isCollision (){
	return false;
}

function run (io){

	Match = function (user1, user2){
		var self = this;
		this.user1 = user1;
		this.user2 = user2;

		this.gameNumber = 1;
		this.game1 = {mazePath:[],trailPath:[], points1:0, points2:0};

		this.user1.socket.emit('initGame', {playerType: 'mazeMaker', gameNumber:1, opponent:this.user2.history()});
		this.user1.playerType = 'mazeMaker';
		this.user1.listen(this);
		this.user2.socket.emit('initGame', {playerType: 'pathFinder', gameNumber:1, opponent:this.user1.history()});
		this.user2.playerType = 'pathFinder';
		this.user2.listen(this);

		this.room = this.user1.username;
		this.user1.socket.join(this.room);
		this.user2.socket.join(this.room);

	};

	User.prototype.listen = function (match){
		var self = this;
		var lineType;
		this.socket.on('sendLine', function (msgData){
			if(msgData.gameNumber != self.gameNumber){
				return;
			}
			lineType = self.playerType == 'pathFinder'? 'path' : 'maze';
			match.drawLine(msgData.line, msgData.gameNumber, lineType);
		});
	};

	Match.prototype.drawLine = function (line, gameNumber ,type){
		io.sockets.in(this.room).emit('drawLine',{line:line, gameNumber:gameNumber,type:type});
	};

}

exports.run = run;