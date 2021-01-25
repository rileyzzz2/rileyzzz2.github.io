import {initResources} from './res.mjs';
import {loadMap} from './map.mjs';
import {startRenderer} from './render.mjs';

Ammo().then(beginPlay);

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

async function beginPlay() {
    await initResources();
    initPhysicsWorld();
    activeMap = await loadMap('3d/maps/delfino.glb', '3d/maps/delfino_collision.glb');
    startRenderer();
    
    activeMap.beginPlay();

    //console.log("begin load");
    //loadModel("3d/wario.glb");
    //console.log("load finished");
}
