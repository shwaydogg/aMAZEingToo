// "use strict";

function run (){

	Match = function (user1, user2){
		this.user1 = user1;
		this.user2 = user2;

		this.user1.socket.emit('inMatch');
		this.user2.socket.emit('inMatch');
	};
}

exports.run = run;