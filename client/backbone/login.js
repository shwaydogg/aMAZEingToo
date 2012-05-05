var CurrentUser = Backbone.Model.extend({
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
        var self = this;
        if(!this.model.get('loggedIn')){
            $(this.el).html( $('#tpl_login_form').html()  );
            if(this.model.get('badPassword')){
                $(this.el).find("#password").after("Nope, not this time my friend...");
            }
            
            this.username = $("#username");
            this.password = $("#password");

            this.username.change(function(e){
                console.log("name change");
              self.model.set({username: $(e.currentTarget).val()});
            });

            this.password.change(function(e){
                console.log("password change");
              self.model.set({password: $(e.currentTarget).val()});
            });
        }
        else{
            $(this.el).html( 'Congrats on logging in!' );
            setTimeout(function (){
                app_router.navigate("waitingroom", {trigger: true, replace: true});
            },500);
        }
    },
    events: {
        "click #login": "login"
    },
    login: function(e){
        var username = this.model.get('username');
        var password = this.model.get('password');
        socket.emit("login",{username:username, password: password});
        this.model.set({'password':null});
        return false;
    }
});


var Opponent = Backbone.Model.extend({
});

var WaitingRoom = Backbone.Collection.extend({
    model:Opponent
});

var OpponentView = Backbone.View.extend({
    tagName: 'li',
    events: {
      'click .challenge':  'challenge',
      'click .remove': 'remove'
    },
    initialize: function (){
      _.bindAll(this, 'render', 'unrender', 'challenge', 'remove'); // every function that uses 'this' as the current object should be in here

      this.model.bind('remove', this.unrender);

      this.render();

    },
    render: function () {
        var template = $("#tpl_opponent").html();
        
        $(this.el).html(Mustache.to_html(template, this.model.toJSON()))
            .css({"display":"none"}).fadeIn();
        return this; // for chainable calls, like .render().el
    },

    unrender: function (){
        $(this.el).slideUp( function(){
            $(this.el).remove();
        });
    },
    remove: function (){
        this.model.destroy();
    },
    challenge: function (){
        console.log(this.model);
        socket.emit('challenge',this.model.get('username'));
    }
});

var WaitingRoomView = Backbone.View.extend({
    el:$("#main"),
    events: {
        'click .allowChallenge': 'allowChallenge'
    },
    initialize: function (){
        var self = this;
        _.bindAll(this, 'render', 'addOpponent', 'appendOpponent', 'allowChallenge'); // every function that uses 'this' as the current object should be in here


        this.collection = new WaitingRoom();
        this.collection.bind('add', this.appendOpponent); // collection event binder

        socket.on('waitingRoom', function (msgData){
            for(var user in msgData){
                self.addOpponent(msgData[user]);
            }
        });

        socket.on('newOpponent',function (msgData){
            self.addOpponent(msgData);
        });

        socket.on('inMatch', function (){
            app_router.navigate("game", {trigger: true, replace: true});
        });

        socket.emit('getWaitingRoom', app_router.loginView.model.get('username') );
        this.render();
    },
    render: function (){
        var self = this;
        $(this.el).html('<button class="allowChallenge">Allow opponents to challenge you! </button><ul id="opponentList"></ul>');
         _(this.collection.models).each(function(opponent){ // in case collection is not empty
            self.appendOpponent(opponent);
        });
    },
    addOpponent: function (opponentData){
        var opponent = new Opponent(opponentData);
        this.collection.add(opponent);
    },
    appendOpponent: function (opponent){
        var opponentView = new OpponentView({model:opponent});
        $('ul',this.el).append(opponentView.render().el);
    },
    allowChallenge: function (){
        socket.emit('joinWaitingRoom');
    }
});