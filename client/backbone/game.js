var Game = Backbone.Model.extend({
    initialize: function(params){
    },
    defaults:{
    }
});

var MainGameView  = Backbone.View.extend({
    el: $("#main"),
    initialize: function(){

        var self = this;

        socket.on('initGame', function (msgData){
            self.render();
            console.log(msgData);
            self.gameView = new GameView({model: new Game(msgData)});
        });

    },
    render: function (){
        $(this.el).html( $('#tpl_MainGameView').html() );

    }
});

var GameView = Backbone.View.extend({
    el: "#gameContainer",
    initialize: function(){
        var self = this;
        _.bindAll(this, 'reportLine'); // every function that uses 'this' as the current object should be in here
        this.canvas = new Canvas(this.model.get('canvas').width,this.model.get('canvas').height);
        this.tracker = new MouseTracks('gameContainer');
        this.canvas.addToDom('gameContainer');

        //init sockets:
        socket.on('drawLine', function (msgData){
            //console.log('drawLine', msgData);
            var lineColor = 'black';
            if(msgData.gameNumber != self.model.get('gameNumber'))
                return;
            if(msgData.type == 'trail'){

                if(self.model.get('playerType') == 'pathFinder'){
                    console.log('setiing lastValidPoint');
                    self.model.set({lastValidPoint:{x:msgData.line.x2, y:msgData.line.y2}});
                }

                lineColor = 'red';
                self.model.set({'inCollision':false});
            }
            self.canvas.drawLine(msgData.line.x1, msgData.line.y1, msgData.line.x2, msgData.line.y2, lineColor);
        });

        socket.on('mazeComplete', function (msgData){
            console.log("mazeComplete");
            //var deInit = self.model.get('deInit');
            var deInit = self.model.attributes.deInit;
            if(deInit){
                deInit();
            }else{
                console.log('deInit not defined');
            }
        });


        socket.on('collision', function (msgData){
            console.log("collision msgData:", msgData);
            self.model.set({'inCollision':true});
        });

        //init SubViews:
        var notificationView = new NotificationView({model:this.model});
        var scoreBoardView = new ScoreBoardView({model:this.model});
        var buttonview = new ButtonView({model:this.model});
        notificationView.render();

        //set playerType:
        if(this.model.get('playerType') == 'mazeMaker'){
            this.model.set({inputMode: 'line'});
        }else if(this.model.get('playerType') == 'pathFinder'){
            this.model.set({inputMode: 'drag'});
        }

        this.initMouse();

    },
    reportLine: function (line){
        socket.emit('sendLine',{gameNumber: this.model.get('gameNumber'), line: {x1: line.x1, y1:line.y1, x2: line.x2, y2: line.y2}});
    },
    initMouse: function(){
        var self = this,
            mouseDelay = 0;
        if (this.model.attributes.deInit)
            this.model.attributes.deInit();

        if( this.model.get('playerType') == 'pathFinder'){
            mouseDelay = 2;
            this.model.set({pathFinderBlockView: new PathFinderBlockView({model:this.model})});
            this.model.set({mazeDrawWait:true});
        }

        setTimeout(function (){
            self.model.set({mazeDrawWait: false});
            var deInit = self.tracker.initMode(self.model.attributes.inputMode, self.reportLine);
            self.model.attributes.deInit =deInit; // save deInit mouse function for later use.  Using set on the model wou
            //Why does this crash browser? : // this.model.set({deInit: deInit}); // save deInit mouse function for later use.  Using set on the model would result in an inifinite loop.
        }, mouseDelay * 1000 );
           
    }

});

var PathFinderBlockView = Backbone.View.extend({
    el: "#gameContainer",
    initialize: function (){
        // every function that uses 'this' as the current object should be in bindAll
        _.bindAll(this, 'render', 'startWait', 'stopWait', 'setBlocks',
            'inCollision', 'noCollision');
        console.log(this);
        this.model.bind('change', this.render);
        this.startWait();

        $(this.el).append($('#tpl_pathFinderBlocks').html());
    },
    render: function (){
        if( this.model.hasChanged("mazeDrawWait")){
            if(!this.model.get("mazeDrawWait")) {
                this.stopWait();
            }
        }
        if( this.model.hasChanged("lastValidPoint")){
            this.setBlocks(this.model.get("lastValidPoint"));
        }
        if( this.model.hasChanged("inCollision")){
            if(this.model.get("inCollision")) {
                this.inCollision();
            }
            else{
                this.noCollision();
            }
        }
    },
    startWait : function () {
        var template = $('#tpl_pathFinderWait').html();
        $(this.el).append(Mustache.to_html( template, this.model.toJSON() ));
    },
    stopWait : function (){
        $('.pathFinderWait').remove();
    },
    setBlocks: function (point){
        var radius = 20;
        $(".leftBlock").width(point.x - radius);
        $(".rightBlock").width( this.model.get('canvas').width - point.x - radius);
        $(".topBlock").height(point.y - radius);
        $(".bottomBlock").height( this.model.get('canvas').height - point.y - radius);
    },
    inCollision: function (){
        var template = $('#tpl_collision').html();
        $(this.el).append(Mustache.to_html( template, this.model.toJSON() ));
    },
    noCollision: function (){
        //inverse of inCollision
        $('.collision').remove();
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