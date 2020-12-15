var background = function (window) {
    'use strict';
    
    window.opspark = window.opspark || {};
    var draw = window.opspark.draw;
    var createjs = window.createjs;
    
    /*
     * Create a background view for our game application
     */
    window.opspark.makeBackground = function(app,ground) {
        /* Error Checking - DO NOT DELETE */
        if(!app) {
            throw new Error("Invaid app argument");
        }
        if(!ground || typeof(ground.y) == 'undefined') {
            throw new Error("Invalid ground argument");
        }
        
        // useful variables
        var canvasWidth = app.canvas.width;
        var canvasHeight = app.canvas.height;
        var groundY = ground.y;
        
        // container which will be returned
        var background;
        
        // ANIMATION VARIABLES HERE:
        var tree;
        var buildings = [];
        // called at the start of game and whenever the page is resized
        // add objects for display in background. draws each image added to the background once
        function render() {
            background.removeAllChildren();

            // TODO: 2 - Part 2
            // this fills the background with a obnoxious yellow
            // you should modify this to suit your game
            var backgroundFill = draw.rect(canvasWidth,groundY,'black');
            background.addChild(backgroundFill);
            
            // TODO: 3 - Add a moon and starfield
            var phil = draw.bitmap('img/phil.png');
            phil.x = 300;
            phil.y = 25;
            phil.scaleX = 1.0;
            phil.scaleY = 1.0;
            background.addChild(phil);

            var m;
            for(let i = 0; i < 100; i++) {
                m = draw.bitmap("img/mnm.jpg");
                m.scaleX = m.scaleY = 0.1;
                m.x = canvasWidth * Math.random();
                m.y = groundY * Math.random();
                background.addChild(m);
            }
            // TODO: 5 - Add buildings!     Q: This is before TODO 4 for a reason! Why?
            for(let i = 0; i < canvasWidth; i += 8) {
                var height = 100;
                var bar = draw.rect(4,height,'Purple','Black',1);
                bar.x = i;
                bar.y = groundY - height;
                background.addChild(bar);
                buildings.push(bar);
            }

            // for(let i = 0; i < 100; i++) {
            //     var buildingHeight = 300;
            //     var building = draw.rect(4,buildingHeight,'LightGray','Black',1);
            //     building.x = 10 * i;
            //     building.y = groundY-buildingHeight;
            //     background.addChild(building);
            //     buildings.push(building);
            // }
            // TODO 4: Part 1 - Add a tree
            
            tree = draw.bitmap('img/tree.png');
            tree.x = 0;
            tree.y = groundY - 220;
            background.addChild(tree);

        } // end of render function - DO NOT DELETE
        
        
        // Perform background animation
        // called on each timer "tick" - 60 times per second
        function update() {
            // useful variables
            var canvasWidth = app.canvas.width;
            var canvasHeight = app.canvas.height;
            var groundY = ground.y;
            
            // TODO 4: Part 2 - Move the tree!
            tree.x -= 3;
            if(tree.x < 0)
                tree.x = canvasWidth;
        
            // TODO 5: Part 2 - Parallax
            for(let i = 0; i < buildings.length; i++) {
                buildings[i].x -= 1;
                if(buildings[i].x < 0)
                    buildings[i].x = canvasWidth;
            }
        } // end of update function - DO NOT DELETE
        
        
        
        /* Make a createjs Container for the background and let it know about the render and upate functions*/
        background = new createjs.Container();
        background.resize = render;
        background.update = update;
        
        /* make the background able to respond to resizing and timer updates*/
        app.addResizeable(background);
        app.addUpdateable(background);
        
        /* render and return the background */
        render();
        return background;
    };
};

// DON'T REMOVE THIS CODE //////////////////////////////////////////////////////
if((typeof process !== 'undefined') &&
    (typeof process.versions.node !== 'undefined')) {
    // here, export any references you need for tests //
    module.exports = background;
}
