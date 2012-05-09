var Game = Backbone.Model.extend({
    initialize: function(params){
    },
    defaults:{
    }
});

var MainGameView  = Backbone.Model.extend({
    el: $("#main"),
    initialize: function(){

        var self = this;

        socket.on('initGame', function (msgData){
            self.render();
            console.log(msgData);
            appRouter.mainGameView = new GameView({model: new Game(msgData)});
        });

    },
    render: function (){
        $(this.el).html( $('#tpl_MainGameView').html() );

    }
});

var GameView = Backbone.View.extend({
    el: $("#gameContainer"),
    initialize: function(){
        var self = this;
        _.bindAll(this, 'render'); // every function that uses 'this' as the current object should be in here
        this.model.bind('change', this.render);
        this.canvas = new Canvas(700,400);
        this.tracker = new MouseTracks('gameContainer');
        this.canvas.addToDom('gameContainer');

        socket.on('drawLine', function (msgData){
            console.log('drawLine', msgData);
            var lineColor = 'black';

            if(msgData.gameNumber != self.model.get('gameNumber'))
                return;

            if(msgData.type == 'trail')
                lineColor = 'red';

            self.canvas.drawLine(msgData.line.x1, msgData.line.y1, msgData.line.x2, msgData.line.y2, lineColor);
            
        });

        socket.on('collision', function (msgData){
            console.log("collision msgData:", msgData)
        });

        var notificationView = new NotificationView({model:this.model});
        var scoreBoardView = new ScoreBoardView({model:this.model});
        var buttonview = new ButtonView({model:this.model});
        notificationView.render();

        if(this.model.get('playerType') == 'mazeMaker'){
            this.model.set({inputMode: 'line'});
        }else if(this.model.get('playerType') == 'pathFinder'){
            this.model.set({inputMode: 'drag'});
        }

    },
    render: function(){
        var self = this;
        this.reportLine = function(line){
            console.log('reportLine', line)
            socket.emit('sendLine',{gameNumber: self.model.get('gameNumber'), line: {x1: line.x1, y1:line.y1, x2: line.x2, y2: line.y2}});
        };
        if (this.model.attributes.deInit)
            this.model.attributes.deInit();
        var deInit = this.tracker.initMode(this.model.attributes.inputMode, this.reportLine);
        this.model.attributes.deInit =deInit; // save deInit mouse function for later use.  Using set on the model would result in an inifinite loop.
    }
});

var NotificationView = Backbone.View.extend({
    el:"#gameNotifications",
    initialize: function(){
        _.bindAll(this, 'render'); // every function that uses 'this' as the current object should be in here
      this.model.bind('change', this.render);
      this.render();
    },
    render: function() {
        var template = '<h2>Match: {{you.username}} VS. {{opponent.username}}</h2> <h3>Game: {{gameNumber}} / 4 </h3> <h3>State: {{playerType}}</h3> ';
        $(this.el).html(Mustache.to_html(template, this.model.toJSON()));
        return this;
    }
});
var ScoreBoardView = Backbone.View.extend({
    el:"#gameScoreBoard",
    initialize: function(){
        _.bindAll(this, 'render'); // every function that uses 'this' as the current object should be in here
        this.model.bind('change', this.render);
        this.render();
    },
    render: function() {
        var template = '<h3>Match: {{you.username}} {{opponent.username}}</h3><h2>{{player1Points}} {{player2Points}}</h2>';
        $(this.el).html(Mustache.to_html(template, this.model.toJSON()));
        return this;
    }
});

var ButtonView = Backbone.View.extend({
    el:'#gameButtons',
    initialize: function(){
        _.bindAll(this, 'render', 'setLineMode', 'setDragMode', 'giveUp'); // every function that uses 'this' as the current object should be in here
        this.model.bind('change', this.render);
        this.render();
    },
    events: {
        "click #setLineMode": "setLineMode",
        "click #setDragMode": "setDragMode",
        "click #giveUp": "giveUp"
    },
    setLineMode: function() {
        this.model.set({inputMode: 'line'});
    },
    setDragMode: function() {
        this.model.set({inputMode: 'dragOnClick'});
    },
    giveUp: function() {
        console.log("GIVE UP!!!!!!!!!!!!!???????????????");
    },
    render: function() {
        var template;
        var playerType = this.model.attributes.playerType;

        if (playerType == "mazeMaker"){
            template = '<button id="setLineMode" {{playerType}}>Line</button> <button id="setDragMode">Drag</button>';
        } else if (playerType == "pathFinder"){
            template = '<button id="giveUp">Give Up!?!</button>';

        } else{
            template = "No buttons for those watching";
        }
        $(this.el).html(template);
        return this;
    }
});