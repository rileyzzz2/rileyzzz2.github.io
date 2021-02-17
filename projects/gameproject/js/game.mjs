import {initResources, PostInitResources} from './res.mjs';
import {loadMap} from './map.mjs';
import {startRenderer} from './render.mjs';

$(document).ready(function() {

    

    //params.get('name') # => "n1";
    //alert("params " + params.get('join'));
    //Ammo().then(beginPlay);
});

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

export function startGame(playerIndex) {
    console.log("starting game");
    //$(".menuOverlay").hide();

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
        scene = new THREE.Scene();
        winners = [];
        localPlayer = null;
        Players = [];

        setCoinCount(0);
        beginPlay();
    }
}

export async function beginPlay() {
    await initResources();
    initPhysicsWorld();
    //activeMap = await loadMap('3d/maps/delfino.glb', '3d/maps/delfino_collision.glb', '3d/maps/delfino_objects.json');
    activeMap = await loadMap('3d/maps/luigicircuit.glb', '3d/maps/circuit_coll.glb', '3d/maps/circuit_objects.json', 0.1);
    //activeMap = await loadMap('3d/maps/mall.glb', '3d/maps/mall_collision.glb');
    startRenderer();
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