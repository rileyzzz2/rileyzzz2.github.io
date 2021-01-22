import {initResources} from './res.mjs';
import {startRenderer} from './render.mjs';

Ammo().then(beginPlay);

document.addEventListener('click', onClick);
function onClick() {
    const mass = 0.2;
    const box = new THREE.BufferGeometry().fromGeometry(new THREE.BoxGeometry());
    let mesh = new THREE.Mesh( box, new THREE.MeshStandardMaterial( { color: 0x00ff00 } ) );
    // newcube.castShadow = true;
    scene.add(mesh);

    let transform = createTransform(mesh);
    let motionState = new Ammo.btDefaultMotionState( transform );
    var localInertia = new Ammo.btVector3( 0, 0, 0 );
    mesh.geometry.computeBoundingBox();
    var shape = new Ammo.btBoxShape(new Ammo.btVector3(mesh.scale.x * 0.5, mesh.scale.y * 0.5, mesh.scale.z * 0.5));
    shape.setMargin( 0.05 );

    shape.calculateLocalInertia( mass, localInertia );
    var rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, shape, localInertia );
    var body = new Ammo.btRigidBody( rbInfo );
    physicsWorld.addRigidBody(body);
    objects.push(new GameObject(mesh, body));
    //mesh.userData.physicsBody = body;
    //rigidBodies.push(mesh);

    // newcube.position.set(camera.position.x, camera.position.y, camera.position.z);
    // newcube.scale.set(1.0, 1.0, 1.0);
    // createRigidBox(newcube, 0.2);
}

async function beginPlay() {
    await initResources();
    initPhysicsWorld();
    startRenderer();

    localPlayer = new Kart();

    //camera.parent = localPlayer.gameObject.mesh;
    //camera.position.x = -2;

    camera.position.y = 2;
    camera.position.z = -3;
    camera.lookAt(0.0, 0.4, 0.0);

    const loader = new THREE.TextureLoader();
    var planeMaterial = new THREE.MeshBasicMaterial({ map: loader.load('debug/mc.png') });// { color: 0xffffff } 

    const mass = 0.0;
    const planemesh = new THREE.BufferGeometry().fromGeometry(new THREE.BoxGeometry());
    let plane = new THREE.Mesh(planemesh, planeMaterial);
    plane.castShadow = true;
    scene.add(plane);
    plane.position.set(0.0, -10.0, 0.0);
    plane.scale.set(100.0, 0.2, 100.0);
    //createRigidBox(plane, 0.0);
    let transform = createTransform(plane);
    let motionState = new Ammo.btDefaultMotionState( transform );
    var localInertia = new Ammo.btVector3( 0, 0, 0 );
    plane.geometry.computeBoundingBox();
    var shape = new Ammo.btBoxShape(new Ammo.btVector3(plane.scale.x * 0.5, plane.scale.y * 0.5, plane.scale.z * 0.5));
    shape.setMargin( 0.05 );

    shape.calculateLocalInertia( mass, localInertia );
    var rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, shape, localInertia );
    var body = new Ammo.btRigidBody( rbInfo );
    physicsWorld.addRigidBody(body);
    objects.push(new GameObject(plane, body));

    //console.log("begin load");
    //loadModel("3d/wario.glb");
    //console.log("load finished");
}
