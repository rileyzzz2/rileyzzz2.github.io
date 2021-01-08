import { EffectComposer } from './lib/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './lib/three/examples/jsm/postprocessing/RenderPass.js';
import { GLTFLoader } from './lib/three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from './lib/three/examples/jsm/loaders/RGBELoader.js';

var params = {
	exposure:   1.0,
	bloomStrength: 0.4,
	bloomThreshold: 0.0,
	bloomRadius: 0.4
};


var ENVTEX;

new RGBELoader()
.setDataType(THREE.UnsignedByteType)
.setPath('3d/')
.load('env_small.hdr', function (texture) { //async 
	ENVTEX = texture;
});




var canvas = $("#gameWindow")[0];

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer({ canvas: canvas });
var renderScene = new RenderPass(scene, camera);
var composer = new EffectComposer(renderer);
composer.addPass(renderScene);

//PBR STUFF
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;
let pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();
let envMap = pmremGenerator.fromEquirectangular(ENVTEX).texture;
//scene.environment = envMap;
pmremGenerator.dispose();

let pointlight = new THREE.PointLight(0xffffff, 0.8, 100);
pointlight.position.set(2, 2, 4);
pointlight.castShadow = true;
scene.add(pointlight);

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

var cube;

function render() {
    requestAnimationFrame(render);


    if(cube)
        cube.rotation.x += 0.1;
    //renderer.render(scene, camera);
	composer.render(scene, camera);
}


var loader = new GLTFLoader();
var castle;
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

function beginPlay() {
    const box = new THREE.BoxGeometry();
    
    cube = new THREE.Mesh( box, material );
    scene.add(cube);

    console.log("begin load");
    loadModel("3d/testcyl.glb");
    console.log("load finished");
    camera.position.z = 5;

}


function loadModel(file) {
    loader.load(file, function (gltf) {
		// let uniforms = {
		// 	colorA: { type: 'vec3', value: new THREE.Color(0x4100f2) }, //0xb967ff
		// 	colorB: { type: 'vec3', value: new THREE.Color(0xfaa80f) },
		// 	time: { type: 'float', value: 1.0 },
		// 	soundTex: { type: 't', value: dTex }
		// }
		// GridMaterial = new THREE.ShaderMaterial({
		// 	uniforms: uniforms,
		// 	vertexShader: document.getElementById('vertexShader').textContent,
		// 	fragmentShader: document.getElementById('fragmentShader').textContent
		// });

		gltf.scene.traverse(function (child) {
			if (child.isMesh) {
				//child.material = material;
			}
		});


        castle = gltf.scene;
        
		scene.add(castle);

	}, undefined, function (error) {

		console.error(error);

	});
}