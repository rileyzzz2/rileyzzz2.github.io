//import g from './lib/gamelib.js';

$( document ).ready(function() {
    g.init();

    //for(let i = 0; i < 20; i++)
        //g.box(50 + i * 4, 50, 10, 10, false);
    g.box(0, g.height, 810, 20, true);
});

$("#gameWindow").click(function(e) {
    var posX = e.pageX - $(this).position().left,
        posY = e.pageY - $(this).position().top;

    g.box(posX, posY, 50, 50, false);
});
//alert("test");