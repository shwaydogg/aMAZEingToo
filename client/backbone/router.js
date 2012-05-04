//"use strict";

var AppRouter = Backbone.Router.extend({
    routes: {
        "game":            "game",    // #help
        "waitingroom":     "waitingroom",
        "*actions":        "login"  // #search/kiwis
    },

    login: function () {
        this.loginView = new LoginView({model:new CurrentUser()});
    },

    waitingroom: function (){
        this.waitingRoomView = new WaitingRoomView({collection: new WaitingRoom()});
    },

    game: function (query, page) {
        var mainGameView = new MainGameView();
    }

});

// Instantiate the router
    var app_router = new AppRouter();
    // Start Backbone history a neccesary step for bookmarkable URL's
    Backbone.history.start();