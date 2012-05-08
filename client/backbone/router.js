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
    }

});

// Instantiate the router
    var appRouter = new AppRouter();
    appRouter.mainGameView = new MainGameView();
    // Start Backbone history a neccesary step for bookmarkable URL's
    Backbone.history.start();