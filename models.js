//"use strict";

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

var CurrentUser = Backbone.Model.extend({
});

var User = Backbone.Model.extend({
});

var MainGameView  = Backbone.Model.extend({
    el: $("#main"),
    initialize: function(){
        $(this.el).html( $('#tpl_MainGameView').html() );

        //create game model and view:
        var game  = new Game({player1UserName:'greg',player2UserName:"Scott", player1Points: 0, player2Points: 0, playerType:'pathFinder'});
        var gameView = new GameView({model:game});

        //this line is temporary: jsut for testing.  Later this will happen via a response to sockets.
        game.set({player1UserName:'greg',player2UserName:"Scott", player1Points: 0, player2Points: 0, playerType:'pathFinder'});
        //this was also just for testing purposes
        setTimeout(function(){
          game.set({player1UserName:'Mustachio', player1Points: 9999999, playerType:"mazeMaker"});
        },3000);

        //create sub views:
        var notificationView = new NotificationView({model:game, el:"#gameNotifications"});
        var scoreBoardView = new ScoreBoardView({model:game, el:"#gameScoreBoard"});
        var buttonview = new ButtonView({model:game, el:'#gameButtons'});

        notificationView.render();
    }
});

var LoginView = Backbone.View.extend({
    el:$("#main"),
    initialize: function(){
        this.render();
        _.bindAll(this, 'render', 'login'); // every function that uses 'this' as the current object should be in here

        var self = this;

        socket.on('newAccount', function(){
            self.model.set({newAccount: true});
            self.model.set({loggedIn: true});
            self.render();
        });
        socket.on('loggedIn', function(){
            self.model.set({loggedIn: true});
            self.render();
        });
        socket.on('badPassword', function(){
            self.model.set({badPassword: true});
            self.render();
        });

    },
    render: function(){
        if(!this.model.get('loggedIn')){
            $(this.el).html( $('#tpl_login_form').html()  );
            if(this.model.get('badPassword')){
                $(this.el).find("#password").after("Nope, not this time my friend...");
            }

            var self = this;
            
            this.username = $("#username");
            this.password = $("#password");

            this.username.change(function(e){
              self.model.set({username: $(e.currentTarget).val()});
            });

            this.password.change(function(e){
              self.model.set({password: $(e.currentTarget).val()});
            });
        }
        else{
            $(this.el).html( 'Congrats on logging in!' );
        }
    },
    events: {
        "click #login": "login"
    },
    login: function(e){
        var user= this.model.get('username');
        var password = this.model.get('password');
        socket.emit("login",{user:user, password: password});
        return false;
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

var AppRouter = Backbone.Router.extend({

  routes: {
    "game":            "game",    // #help
    "*actions":        "login"  // #search/kiwis
  },

  login: function() {
    var loginView = new LoginView({model:new CurrentUser()});
  },

  game: function(query, page) {
    console.log('in game router');
    var mainGameView = new MainGameView();
    
  }

});

// Instantiate the router
    var app_router = new AppRouter();
    // Start Backbone history a neccesary step for bookmarkable URL's
    Backbone.history.start();