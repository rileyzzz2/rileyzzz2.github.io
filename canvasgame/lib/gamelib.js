class game {
    //#canvas;
    //#ctx;
    //#objects = [];
    constructor() {
        this.objects = [];
    }

    init() {
        this.canvas = $("#gameWindow")[0];
        //this.ctx = $("#gameWindow")[0].getContext('2d');
        
        //begin render
        window.requestAnimationFrame((t)=>this.render(t));
    }

    box(isStatic, _x, _y, _w, _h) {
        this.objects.push({
            type: "box",
            static: isStatic,
            x: _x,
            y: _y,
            w: _w,
            h: _h
        });
    }
    render(time) {
        //console.log(time);
        var ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for(let i = 0; i < this.objects.length; i++) {
            let obj = this.objects[i];
            switch(obj.type) {
                case "box":
                    
                    break;
            }
        }
        
        window.requestAnimationFrame((t)=>this.render(t));
    }
}

const g = new game();
//export default g;