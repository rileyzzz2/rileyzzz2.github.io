
var Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Composite = Matter.Composite,
    Bodies = Matter.Bodies;

// create an engine
var engine = Engine.create();

// create two boxes and a ground
//var boxA = Bodies.rectangle(400, 200, 80, 80);
//var boxB = Bodies.rectangle(450, 50, 80, 80);
//var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

// add all of the bodies to the world
//World.add(engine.world, [ground]);

// run the engine
Engine.run(engine);

// run the renderer
//Render.run(render);

class game {
    //#canvas;
    //#ctx;
    //#objects = [];
    constructor() {
        this.objects = [];
    }

    init() {
        this.canvas = $("#gameWindow")[0];
        this.height = this.canvas.height;
        //this.ctx = $("#gameWindow")[0].getContext('2d');
        
        // var render = Render.create({
        //     canvas: this.canvas,
        //     engine: engine
        // });
        
        // Render.run(render);

        //begin render
        window.requestAnimationFrame((t)=>this.render(t));
    }

    box(_x, _y, _w, _h, is_static) {
        var box = Bodies.rectangle(_x, _y, _w, _h, { isStatic: is_static });
        this.objects.push(box);
        World.add(engine.world, [box]);
        return box;
    }
    render(time) {
        //console.log(time);
        var ctx = this.canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        var bodies = Composite.allBodies(engine.world);
        //ctx.fillStyle = 'orange';
        
        ctx.beginPath();

        for (var i = 0; i < bodies.length; i++) { 
            // var r = Math.random() * 255;
            // var g = Math.random() * 255;
            // var b = Math.random() * 255;
            // ctx.fillStyle = 'rgb(' + String(r) + ', ' + String(g) + ', ' + String(b) + ')';
            var vertices = bodies[i].vertices;

            ctx.moveTo(vertices[0].x, vertices[0].y);
            for (var j = 1; j < vertices.length; j++)
                ctx.lineTo(vertices[j].x, vertices[j].y);
            
            ctx.lineTo(vertices[0].x, vertices[0].y);
            ctx.fill();
        }
        
        window.requestAnimationFrame((t)=>this.render(t));
        
    }
}

const g = new game();
//export default g;