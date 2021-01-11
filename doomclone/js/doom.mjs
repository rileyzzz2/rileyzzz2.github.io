import { EffectComposer } from './lib/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './lib/three/examples/jsm/postprocessing/RenderPass.js';
import { GLTFLoader } from './lib/three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from './lib/three/examples/jsm/loaders/RGBELoader.js';

let physicsWorld;
var rigidBodies = [], tmpTrans;
function initPhysicsWorld() {
    let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
    dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
    overlappingPairCache    = new Ammo.btDbvtBroadphase(),
    solver                  = new Ammo.btSequentialImpulseConstraintSolver();

    physicsWorld           = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));
}

Ammo().then(start);
function start() {
    initPhysicsWorld();
    tmpTrans = new Ammo.btTransform();
    clock = new THREE.Clock();
    
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
    var renderer = new THREE.WebGLRenderer({ canvas: canvas });
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
        pmremGenerator.dispose();
    });

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
        //console.log("mousemove " + event.movementX + " " + event.movementY);
        //console.log("mousemove " + event.movementX + " " + event.movementY);
        var X = event.movementX;// || (prevX ? event.screenX - prevX : 0);
        var Y = event.movementY;// || (prevY ? event.screenY - prevY : 0);

        //console.log("mousemove " + X + " " + Y);
        //camera.rotateOnAxis(new THREE.Vector3(0.0, 1.0, 0.0), -X / 100.0);
        //camera.rotation.y -= X / 100.0;

        //camera.rotateOnWorldAxis(new THREE.Vector3(0.0, 1.0, 0.0), -X / 100.0);
        camera.rotation.y += -X / 100.0;
        //camera.rotateOnAxis(new THREE.Vector3(1.0, 0.0, 0.0), -Y / 100.0);
        camera.rotation.x += -Y / 100.0;
        //if(camera.rotation.x > -Math.PI / 2.0 && camera.rotation.x < Math.PI / 2.0)
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
        physicsWorld.stepSimulation(deltaTime);

        var forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        var right = forward.clone();

        right.applyAxisAngle(new THREE.Vector3( 0, 1, 0 ), -Math.PI / 2);
        right.y = 0.0;
        right.normalize();

        const speed = 0.5;
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
        return new Ammo.btVector3();
    }
    function createTransform(mesh) {
        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin( new Ammo.btVector3( mesh.position.x, mesh.position.y, mesh.position.z ) );
        transform.setRotation( new Ammo.btQuaternion( mesh.quaternion.x, mesh.quaternion.y, mesh.quaternion.z, mesh.quaternion.w ) );
        return transform;
    }
    function createRigidBox(mesh) {
        let transform = createTransform(mesh);
        let motionState = new Ammo.btDefaultMotionState( transform );
        mesh.geometry.computeBoundingBox();
        //mesh.geometry.boundingBox.min/max
        let colShape = new Ammo.btBoxShape( new Ammo.btVector3( scale.x * 0.5, scale.y * 0.5, scale.z * 0.5 ) );
        colShape.setMargin( 0.05 );
    }

    function beginPlay() {
        let pos = {x: 0, y: 0, z: 0};
        let scale = {x: 1, y: 1, z: 1};
        const box = new THREE.BoxGeometry();
        cube = new THREE.Mesh( box, material );
        scene.add(cube);
        cube.position.set(pos.x, pos.y, pos.z);
        cube.scale.set(scale.x, scale.y, scale.z);
        createRigidBox(cube);

        console.log("begin load");
        loadModel("3d/castle.glb");
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

}