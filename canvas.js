function Canvas (width, height){
    this.width = width;
    this.height = height;
    this.el = document.createElement('canvas');
    this.el.setAttribute('width', width);
    this.el.setAttribute('height',height);
}

Canvas.prototype.addToDom = function(id){
    document.getElementById(id).appendChild(this.el);
};

Canvas.prototype.drawLine = function (x1,y1,x2,y2,color,radius){
    if (typeof color == "number"){
        radius = color;
        color = null; 
    }
    if (this.el.getContext){
        var ctx = this.el.getContext('2d');
        ctx.lineWidth = radius || 2;
        ctx.strokeStyle=color || "black";
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x1,y1);
        ctx.lineTo(x2,y2);
        ctx.stroke();
    }
};

Canvas.prototype.clear = function (){
    if (this.el.getContext){
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
};