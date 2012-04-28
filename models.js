reporterFunction = function(line){
    console.log('Line:',line);
    can.drawLine(line.x1,line.y1,line.x2,line.y2);
};

var Game = Backbone.Model.extend({
    initialize: function(params){
        this.points = {pathFinder: 0, mazeMaker: 0};
        this.mazePath = [];
        this.trailPath = [];
        //this.playerType = params.playerType; //'mazeMaker', 'pathFinder', 'watcher'
        //this.inputMode;
        this.set({gameNumber: 1});
    },
    defaults:{
        inputMode : "dragOnClick"
    }
});


var GameView = Backbone.View.extend({
    //model: Game, // this seems to not be the common way to bind model and view
    el: $("#gameContainer"),
    initialize: function(){
        _.bindAll(this, 'render'); // every function that uses 'this' as the current object should be in here
        this.model.bind('change', this.render);
        this.canvas = new Canvas(700,400);
        this.tracker = new MouseTracks('gameContainer');
        this.canvas.addToDom('gameContainer');
    },
    render: function(){
        var self = this;
        this.reportLine = function(line){
            //console.log('cLine:',line);
            self.canvas.drawLine(line.x1,line.y1,line.x2,line.y2);
        };
        if (this.model.attributes.deInit)
            this.model.attributes.deInit();
        var deInit = this.tracker.initMode(this.model.attributes.inputMode, this.reportLine);
        this.model.attributes.deInit =deInit; // save deInit mouse function for later use.  Using set on the model would result in an inifinite loop.
    }
});

var NotificationView = Backbone.View.extend({
    initialize: function(){
        _.bindAll(this, 'render'); // every function that uses 'this' as the current object should be in here
      this.model.bind('change', this.render);
      this.render();
    },
    render: function() {
        var template = '<h2>Match: {{player1UserName}} VS. {{player2UserName}}</h2> <h3>Game: {{gameNumber}} / 4 </h3> <h3>State: {{playerType}}</h3> ';
        $(this.el).html(Mustache.to_html(template, this.model.toJSON()));
        return this;
    }
});
var ScoreBoardView = Backbone.View.extend({
    initialize: function(){
        _.bindAll(this, 'render'); // every function that uses 'this' as the current object should be in here
        this.model.bind('change', this.render);
        this.render();
    },
    render: function() {
        var template = '<h3>Match: {{player1UserName}} {{player2UserName}}</h3><h2>{{player1Points}} {{player2Points}}</h2>';
        $(this.el).html(Mustache.to_html(template, this.model.toJSON()));
        return this;
    }
});

var ButtonView = Backbone.View.extend({
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
        console.log("sooooo you want to drag lines eh?");
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
            //wat
            template = "No buttons for those watching";
        }
        $(this.el).html(template);
        return this;
    }
});