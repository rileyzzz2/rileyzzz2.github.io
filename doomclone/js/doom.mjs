import { EffectComposer } from './lib/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './lib/three/examples/jsm/postprocessing/RenderPass.js';

var canvas = $("#gameWindow")[0];

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer({ canvas: canvas });
var renderScene = new RenderPass(scene, camera);
var composer = new EffectComposer(renderer);
composer.addPass(renderScene);

$( document ).ready(function() {
    beginPlay();
    onWindowResize();
    render();
});

$( document ).on('pointerlockchange', function() {

});

var prevX = 0;
var prevY = 0;
$("#gameWindow").mousemove(function(event) {
    //console.log("mousemove " + event.movementX + " " + event.movementY);
    //console.log("mousemove " + event.movementX + " " + event.movementY);
    var X = event.screenX - prevX;
    var Y = event.screenY - prevY;
    //console.log("mousemove " + X + " " + Y);

    prevX = event.screenX;
    prevY = event.screenY;
});

function beginCapture() {
    document.removeEventListener('click', beginCapture);
    canvas.requestPointerLock();
}
document.addEventListener('click', beginCapture);


window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
	composer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
    requestAnimationFrame(render);

    //renderer.render(scene, camera);
	composer.render(scene, camera);
}

function beginPlay() {
    const box = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const cube = new THREE.Mesh( box, material );
    scene.add(cube);

    camera.position.z = 5;
}