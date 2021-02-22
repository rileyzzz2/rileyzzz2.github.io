import {initResources, PostInitResources} from './res.mjs';
import {loadMap} from './map.mjs';
import {startRenderer} from './render.mjs';

$(document).ready(function() {

    //params.get('name') # => "n1";
    //alert("params " + params.get('join'));
    //Ammo().then(beginPlay);
});

function setMapSelection(idx) {
    console.log("setmap " + idx);
    for(var i = 0; i < maps.length; i++) {
        let ele = $(".mapSelection").children().eq(i);
        let map = maps[i];
        if(i === idx)
            ele.css("border-width", "4px");
        else
            ele.css("border-width", "0px");
    }
    selectedMap = idx;
}

export function updateMapList() {
    console.log("updating map list");
    console.trace();
    $(".mapSelection").show();
    $(".mapSelection").empty();
    for(var i = 0; i < maps.length; i++) {
        let map = maps[i];
        var sel = $("<div class='mapSelector'>" + map.name + "</div>");
        sel.css("background-image", "url(" + map.img + ")");
        let idx = i;
        sel.click(function() {
            setMapSelection(idx);
        });
        $(".mapSelection").append(sel);
    }
}

// document.addEventListener('click', onClick);
// function onClick() {
//     const mass = 0.2;
//     const box = new THREE.BufferGeometry().fromGeometry(new THREE.BoxGeometry());
//     let mesh = new THREE.Mesh( box, new THREE.MeshStandardMaterial( { color: 0x00ff00 } ) );
//     // newcube.castShadow = true;
//     scene.add(mesh);

//     let transform = createTransform(mesh);
//     let motionState = new Ammo.btDefaultMotionState( transform );
//     var localInertia = new Ammo.btVector3( 0, 0, 0 );
//     mesh.geometry.computeBoundingBox();
//     var shape = new Ammo.btBoxShape(new Ammo.btVector3(mesh.scale.x * 0.5, mesh.scale.y * 0.5, mesh.scale.z * 0.5));
//     shape.setMargin( 0.05 );

//     shape.calculateLocalInertia( mass, localInertia );
//     var rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, shape, localInertia );
//     var body = new Ammo.btRigidBody( rbInfo );
//     physicsWorld.addRigidBody(body);
//     objects.push(new GameObject(mesh, body));
//     //mesh.userData.physicsBody = body;
//     //rigidBodies.push(mesh);

//     // newcube.position.set(camera.position.x, camera.position.y, camera.position.z);
//     // newcube.scale.set(1.0, 1.0, 1.0);
//     // createRigidBox(newcube, 0.2);
// }

export function gameFinish() {
    
}

var gameInit = false;

export function startGame(playerIndex, map) {
    console.log("starting game");
    //$(".menuOverlay").hide();
    selectedMap = map;

    $(".lobbyInfo").hide();
    $(".waitingPlayers").show();

    localPlayerIndex = playerIndex;


    
    if(typeof(Ammo) === "function")
        Ammo().then(beginPlay);
    else {
        physicsCleanup();
        objects = [];
        thinkers = [];
        networkThinkers = [];
        while(scene.children.length > 0) { 
            scene.remove(scene.children[0]); 
        }
        winners = [];
        localPlayer = null;
        Players = [];

        $("#coinCount").text(0);
        $(".coinCounter").css("color", "white");
        $(".itemIcon").attr("src", "img/ui/item/none.png");
        $("#lapCount").text("1/3");
        //setCoinCount(0);
        beginPlay();
    }
}

export async function beginPlay() {
    await initResources();
    if(!gameInit) {
        gameInit = true;
        initPhysicsWorld();
        
    }
    startRenderer();
    //activeMap = await loadMap('3d/maps/delfino.glb', '3d/maps/delfino_collision.glb', '3d/maps/delfino_objects.json');
    console.log("selected " + selectedMap);
    var usemap = maps[selectedMap];
    activeMap = await loadMap(usemap.model, usemap.collision, usemap.data, usemap.scale);

    //activeMap = await loadMap('3d/maps/mall.glb', '3d/maps/mall_collision.glb');
    
    await PostInitResources();
    activeMap.beginPlay();
    if(typeof(startDebug) === "function")
        startDebug();

    //tell the server that we're ready to start the match
    if(!isHost) {
        hostConn.send({
            type: "playerLoaded",
            index: localPlayerIndex
        });
    }
}

export function beginMatch() {
    console.log("beginning match");
    $(".menuOverlay").hide();
    countdown(3);
    $(".countdown").show();

    
    window.setTimeout(() => {countdown(2);}, 1000);
    window.setTimeout(() => {countdown(1);}, 2000);
    window.setTimeout(() => {countdown(0);}, 3000);
}

function refreshAnim() {
    $("#countdownimg").removeClass("countdownAnim");
    setTimeout(function() {
        $("#countdownimg").addClass("countdownAnim");
    }, 10);
}
function countdown(number) {
    //console.log(number);
    refreshAnim();

    //animationend
    $("#countdownimg").attr("src", "img/countdown_" + number + ".png");
    if(number === 0) {
        //$("#countdownimg").removeClass("countdownAnim");
        $(".countdown").hide();
        allowInput = true;
    }
}