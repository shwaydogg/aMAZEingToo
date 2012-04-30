//START: from quirksmode.org/js/findpos.html
function findPos(obj) {
    var curleft = 0,
        curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
    }
    return {x:curleft,y:curtop};
}
//END: from quirksmode.org/js/findpos.html

function addEvent(element,e,foo){
    if ( element.addEventListener ) {
        element.addEventListener( e, foo, false );
    // If IE event model is used
    }else if ( element.attachEvent ) {
        element.attachEvent( e, foo );
    }
}

function removeEvent(element,e,foo){
    if ( element.removeEventListener ) {
        element.removeEventListener( e, foo, false );
    // If IE event model is used
    }else if ( element.detachEvent ) {
        element.detachEvent( e, foo );
    }
}

function MouseTracks (el){
    this.el = document.getElementById(el); //jQuery Identifier, string
}

MouseTracks.prototype.onUp = function (e){
    if(this.prev)
        this.offSet = findPos(this.el) ;
        this.reporterFunction({  x1:this.prev.x - this.offSet.x,
                            y1:this.prev.y - this.offSet.y,
                            x2:e.pageX - this.offSet.x,
                            y2:e.pageY - this.offSet.y
                              });
    removeEvent(this.el, "mousemove", this.onDragFun);
    removeEvent(document, "mouseup", this.onUpFun);
};

MouseTracks.prototype.onDown = function(e){
    var thisMouseTrack = this;
    this.prev = null;
    if(this.mode == "line"){
        this.prev = {x:e.pageX, y:e.pageY};
    }else{
        //We are in onDrag mode, every movement of the mouse will be reported untill mouseup
        addEvent(thisMouseTrack.el , 'mousemove', thisMouseTrack.onDragFun);
    }
    addEvent(document , 'mouseup', thisMouseTrack.onUpFun);
};

MouseTracks.prototype.onDrag = function(e){
    if (this.prev === null){
        this.prev = {x:e.pageX, y:e.pageY};
        return;
    }
    this.offSet = findPos(this.el) ;

    this.reporterFunction({  x1:this.prev.x - this.offSet.x,
                        y1:this.prev.y - this.offSet.y,
                        x2:e.pageX - this.offSet.x,
                        y2:e.pageY - this.offSet.y
                    });
    this.prev = {x:e.pageX, y:e.pageY};
};

MouseTracks.prototype.initFunctions = function (){
    var thisMouseTrack = this;
    this.onDragFun = function(e){
        thisMouseTrack.onDrag(e);
    };

    this.onDownFun = function(e){
        thisMouseTrack.onDown(e);
    };

    this.onUpFun = function(e){
        thisMouseTrack.onUp(e);
    };
};

MouseTracks.prototype.initMode = function (mode, reporterFunction){
    this.initFunctions();
    this.prev = null;
    var thisMouseTrack = this;
    this.mode = mode;
    this.reporterFunction = reporterFunction;

    if(mode=='drag'){
        addEvent(thisMouseTrack.el , 'mousemove', thisMouseTrack.onDragFun);
    }else if (mode == 'line' || mode == 'dragOnClick'){
        addEvent(thisMouseTrack.el , 'mousedown', thisMouseTrack.onDownFun);
    }
    else{
        console.log("MODE NOT FOUND. You entered the mode: '"+mode+"'. \nAccepted modes are: drag', 'dragOnClick' and 'line'");
    }

    return function (){
        //De-Initialization function for MouseTracks; 
        removeEvent(thisMouseTrack.el , 'mousemove', thisMouseTrack.onDragFun);
        removeEvent(thisMouseTrack.el , 'mousedown', thisMouseTrack.onDownFun);
        removeEvent(document , 'mouseup', thisMouseTrack.onUpFun);
    };
};