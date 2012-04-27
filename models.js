reporterFunction = function(line){
    console.log('Line:',line);
    can.drawLine(line.x1,line.y1,line.x2,line.y2);
};

var Game = Backbone.Model.extend({
    initialize: function(params){
        this.points = {pathFinder: 0, mazeMaker: 0};
        this.mazePath = [];
        this.trailPath = [];
        this.playerType = params.playerType; //'mazeMaker', 'pathFinder', 'watcher'
        //this.inputMode;
        this.player1UserName = params.player1UserName;
        this.player2UserName = params.player2UserName;
        this.gameNumber = 1;
    }
});

var GameView = Backbone.View.extend({
    //model: Game, // this seems to not be the common way to bind model and view
    el: $("#gameContainer"),
    initialize: function(){
        this.canvas = new Canvas(700,400);
        this.tracker = new MouseTracks('gameContainer');
    },
    render: function(){
        var self = this;
        this.reportLine = function(line){
            console.log('cLine:',line);
            self.canvas.drawLine(line.x1,line.y1,line.x2,line.y2);
        };
        this.canvas.addToDom('gameContainer');
        this.tracker.initMode("drag", this.reportLine);
    }
});

var NotificationView = Backbone.View.extend({
    initialize: function(){
        this.boo = "boo";
    },
    render: function() {
        var template = '<h2>Match: {{player1UserName}} VS. {{player2UserName}}</h2> <h3>Game: {{gameNumber}}4 </h3> <h3>State: {{playerType}}</h3> ';
        //var context = _.extend(this.model.toJSON()));
        console.log('model',this.model);
        //console.log('context',context);
        console.log("toJSON",this.model.toJSON());
        $(this.el).html(Mustache.to_html(template, this.model.toJSON()));
        return this;
    }
});

// var ButtonView = Backbone.View.extend({
//     initialize:function(){
//         //bindings

//     } ,
//     events:{
//         'click selector' : 'func' 
//     }, 
//     render: function() {
//         var template = '\
//           <li id="movie_{{ cid }}"><span class="title">{{ title }}</span> <span>{{ format }}</span>   <a href="#movies/remove/{{ cid }}">x</a></li>\
//         ';
//         var context = _.extend(this.model.toJSON(), {cid: this.model.cid});
//         $(this.el).html(Mustache.to_html(template, context));
//         return this;
//       }
// })