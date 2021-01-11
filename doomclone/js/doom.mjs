import { EffectComposer } from './lib/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './lib/three/examples/jsm/postprocessing/RenderPass.js';
import { GLTFLoader } from './lib/three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from './lib/three/examples/jsm/loaders/RGBELoader.js';

const output = $("#outputlog")[0];
function print(msg) {
    output.textContent += msg + '\n';
}
window.onerror = function(message, source, lineno, colno, error) {
    print(message + " line: " + lineno + " col: " + colno);
    //this.output("ERROR: " + message + " line: " + lineno + " col: " + colno);
};

var _log = console.log,
    _warn = console.warn,
    _error = console.error;

console.log = function() {
    for(var k in arguments)
        print("LOG: " + arguments[k]);
    return _log.apply(console, arguments);
};

console.warn = function() {
    for(var k in arguments)
        print("WARN: " + arguments[k]);
    return _warn.apply(console, arguments);
};

console.error = function() {
    for(var k in arguments)
        print("ERR: " + arguments[k]);
    return _error.apply(console, arguments);
};

let physicsWorld;
var rigidBodies = [], tmpTrans;
function initPhysicsWorld() {
    let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
    dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
    overlappingPairCache    = new Ammo.btDbvtBroadphase(),
    solver                  = new Ammo.btSequentialImpulseConstraintSolver();

    physicsWorld           = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0.0, -9.8, 0.0));
}

Ammo().then(start);
function start() {
    initPhysicsWorld();
    tmpTrans = new Ammo.btTransform();
    var clock = new THREE.Clock();

    var params = {
        exposure:   1.0,
        bloomStrength: 0.4,
        bloomThreshold: 0.0,
        bloomRadius: 0.4
    };



    //https://medium.com/@bluemagnificent/intro-to-javascript-3d-physics-using-ammo-js-and-three-js-dd48df81f591
    //https://medium.com/media/4841d3cf6d0b8898cca4b1474dbf32b6

    var canvas = $("#gameWindow")[0];

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    var renderScene = new RenderPass(scene, camera);
    var composer = new EffectComposer(renderer);
    composer.addPass(renderScene);

    //PBR STUFF
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputEncoding = THREE.sRGBEncoding;

    new RGBELoader()
    .setDataType(THREE.UnsignedByteType)
    .setPath('3d/')
    .load('env_small.hdr', async function (texture) { //async 
        //ENVTEX = texture;
        
        let pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();
        let envMap = pmremGenerator.fromEquirectangular(texture).texture;
        scene.environment = envMap;
        scene.background = envMap;
        pmremGenerator.dispose();
    });

    // let pointlight = new THREE.PointLight(0xffffff, 0.8, 100);
    // pointlight.position.set(2, 2, 4);
    // pointlight.castShadow = true;
    // scene.add(pointlight);
    let sunlight = new THREE.DirectionalLight(0xffffff, 0.5 );
    sunlight.position.set(100, 100, 100);
    scene.add(sunlight);

    // $( document ).ready(function() {
    //     beginPlay();
    //     onWindowResize();
    //     render();
    // });

    $( document ).on('pointerlockchange', function() {
        if(document.pointerLockElement === canvas) {
            document.removeEventListener('click', beginCapture);
        } else {
            document.addEventListener('click', beginCapture);
        }
    });

    var bMoveForward = false;
    var bMoveBackward = false;
    var bMoveRight = false;
    var bMoveLeft = false;

    function ProcessInput (key, state) {
        switch(event.key)
        {
        case "ArrowUp":
            bMoveForward = state;
            break;
        case "ArrowDown":
            bMoveBackward = state;
            break;
        case "ArrowRight":
            bMoveRight = state;
            break;
        case "ArrowLeft":
            bMoveLeft = state;
        default:
            break;
        }
    }

    $( document ).on('keydown', function (event) {
        if (event.defaultPrevented)
            return;
        ProcessInput(event.key, true);
    })

    $( document ).on('keyup', function (event) {
        if (event.defaultPrevented)
            return;
        ProcessInput(event.key, false);
    })

    var prevX = 0;
    var prevY = 0;
    
    camera.rotation.order = 'ZYX';
    $("#gameWindow")[0].addEventListener("mousemove", mousemove);
    function mousemove(event) {
        var X = event.movementX;// || (prevX ? event.screenX - prevX : 0);
        var Y = event.movementY;// || (prevY ? event.screenY - prevY : 0);

        //console.log("mousemove " + X + " " + Y);
        //camera.rotateOnAxis(new THREE.Vector3(0.0, 1.0, 0.0), -X / 100.0);
        //camera.rotation.y -= X / 100.0;

        //camera.rotateOnWorldAxis(new THREE.Vector3(0.0, 1.0, 0.0), -X / 100.0);
        //camera.rotateOnAxis(new THREE.Vector3(1.0, 0.0, 0.0), -Y / 100.0);
        camera.rotation.y += -X / 100.0;
        camera.rotation.x += -Y / 100.0;
        camera.rotation.x = Math.min(camera.rotation.x, Math.PI / 2.0);
        camera.rotation.x = Math.max(camera.rotation.x, -Math.PI / 2.0);
        console.log(camera.rotation);
        //camera.rotation.y -= X / 100.0;
        //camera.rotation.x -= Y / 100.0;

        prevX = event.screenX;
        prevY = event.screenY;
    }

    function beginCapture() {
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
        let deltaTime = clock.getDelta();
        //if(physicsWorld)
        physicsWorld.stepSimulation(deltaTime);

        var forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        var right = forward.clone();

        right.applyAxisAngle(new THREE.Vector3( 0, 1, 0 ), -Math.PI / 2);
        right.y = 0.0;
        right.normalize();

        //const speed = 0.5 * deltaTime;
        let speed = 50.0 * deltaTime;
        forward.multiplyScalar(speed);
        right.multiplyScalar(speed);

        if(bMoveForward)
            camera.position.add(forward);
        if(bMoveBackward)
            camera.position.sub(forward);
        if(bMoveRight)
            camera.position.add(right);
        if(bMoveLeft)
            camera.position.sub(right);

        //camera.lookAt(0.0, 0.0, 0.0);

        if(cube)
            cube.rotation.x += 0.1;
        //renderer.render(scene, camera);
        composer.render(scene, camera);
    }


    var loader = new GLTFLoader();
    var castle;
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

    function pvec(vec)
    {
        return new Ammo.btVector3(vec.x, vec.y, vec.z);
    }
    function pquat(quat)
    {
        return new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w);
    }
    function createTransform(mesh) {
        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(pvec(mesh.position));
        transform.setRotation(pquat(mesh.quaternion));
        return transform;
    }
    function createRigidBox(mesh) {
        let transform = createTransform(mesh);
        let motionState = new Ammo.btDefaultMotionState( transform );
        mesh.geometry.computeBoundingBox();
        //mesh.geometry.boundingBox.min/max
        //let colShape = new Ammo.btBoxShape( new Ammo.btVector3( scale.x * 0.5, scale.y * 0.5, scale.z * 0.5 ) );
        //colShape.setMargin( 0.05 );
    }

    function beginPlay() {
        let pos = {x: 0, y: 0, z: 0};
        let scale = {x: 1, y: 1, z: 1};
        const box = new THREE.BufferGeometry().fromGeometry(new THREE.BoxGeometry());
        cube = new THREE.Mesh( box, material );
        scene.add(cube);
        cube.position.set(pos.x, pos.y, pos.z);
        cube.scale.set(scale.x, scale.y, scale.z);
        createRigidBox(cube);

        console.log("begin load");
        //loadModel("3d/castle.glb");
        console.log("load finished");
        camera.position.z = 5;

    }


    async function loadModel(file) {
        loader.load(file, async function (gltf) {
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
            castle.castShadow = true;
            scene.add(castle);

        }, undefined, function (error) {

            console.error(error);

        });
    }

    beginPlay();
    onWindowResize();
    render();
}