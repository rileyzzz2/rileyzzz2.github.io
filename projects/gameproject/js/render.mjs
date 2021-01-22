import { EffectComposer } from './lib/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './lib/three/examples/jsm/postprocessing/RenderPass.js';
import { GLTFLoader } from './lib/three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from './lib/three/examples/jsm/loaders/RGBELoader.js';


export function startRenderer() {
    tmpTrans = new Ammo.btTransform();
    var clock = new THREE.Clock();

    var params = {
        exposure:   1.0,
        bloomStrength: 0.4,
        bloomThreshold: 0.0,
        bloomRadius: 0.4
    };

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
    .load('env.hdr', async function (texture) {
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

    let sunlight = new THREE.DirectionalLight(0xffffff, 1, 100);
    sunlight.position.set(100, 100, 100);
    sunlight.castShadow = true;

    sunlight.shadow.mapSize.width = 512; // default
    sunlight.shadow.mapSize.height = 512; // default
    sunlight.shadow.camera.near = 0.5; // default
    sunlight.shadow.camera.far = 500; // default

    scene.add(sunlight);


    // camera.rotation.order = 'ZYX';
    // canvas.addEventListener("mousemove", mousemove);
    // function mousemove(event) {
    //     var X = event.movementX;// || (prevX ? event.screenX - prevX : 0);
    //     var Y = event.movementY;// || (prevY ? event.screenY - prevY : 0);

    //     camera.rotation.y += -X / 100.0;
    //     camera.rotation.x += -Y / 100.0;
    //     camera.rotation.x = Math.min(camera.rotation.x, Math.PI / 2.0);
    //     camera.rotation.x = Math.max(camera.rotation.x, -Math.PI / 2.0);
    // }


    window.addEventListener('resize', onWindowResize, false);
    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
    }

    function render() {
        requestAnimationFrame(render);
        let deltaTime = clock.getDelta();
        //if(physicsWorld)

        //camera smoothing
        // if(localPlayer) {
        //     var target = new THREE.Vector3();
        //     var lookTarget = localPlayer.gameObject.mesh.position.clone();
        //     lookTarget.y += 0.4;
        //     target.setFromMatrixPosition(localPlayer.cameraTarget.matrixWorld);
        //     camera.position.lerp(target, 0.1);
        //     camera.lookAt(lookTarget);
        // }

        physicsWorld.stepSimulation(deltaTime, 10);

        for(let i = 0; i < objects.length; i++)
            objects[i].update(deltaTime);

        // for ( let i = 0; i < rigidBodies.length; i++ ) {
        //     let objThree = rigidBodies[i];
        //     let objAmmo = objThree.userData.physicsBody;
        //     let ms = objAmmo.getMotionState();
        //     if ( ms ) {
        //         ms.getWorldTransform( tmpTrans );
        //         let p = tmpTrans.getOrigin();
        //         let q = tmpTrans.getRotation();
        //         objThree.position.set( p.x(), p.y(), p.z() );
        //         objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );
        //     }
        // }

        
        

        //DEBUG MOVEMENT =====================================================================
        // var forward = new THREE.Vector3();
        // camera.getWorldDirection(forward);
        // var right = forward.clone();

        // right.applyAxisAngle(new THREE.Vector3( 0, 1, 0 ), -Math.PI / 2);
        // right.y = 0.0;
        // right.normalize();

        // //const speed = 0.5 * deltaTime;
        // let speed = 50.0 * deltaTime;
        // forward.multiplyScalar(speed);
        // right.multiplyScalar(speed);

        // if(bMoveForward)
        //     camera.position.add(forward);
        // if(bMoveBackward)
        //     camera.position.sub(forward);
        // if(bMoveRight)
        //     camera.position.add(right);
        // if(bMoveLeft)
        //     camera.position.sub(right);
        //END DEBUG MOVEMENT =================================================================
        //camera.lookAt(0.0, 0.0, 0.0);

        //renderer.render(scene, camera);
        composer.render(scene, camera);
    }


    var loader = new GLTFLoader();
    var castle;

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

    onWindowResize();
    render();
}