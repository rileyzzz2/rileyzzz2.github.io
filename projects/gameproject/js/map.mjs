import { loadModel } from './res.mjs';
//https://stackoverflow.com/questions/59665854/ammo-js-custom-mesh-collision-with-sphere
class Map {
    constructor(mapScene) {
        this.mapScene = mapScene;
        var startPos, startQuat;
        this.mapScene.traverse(function (child) {
            if(child.name === "course_start") {
                startPos = child.position;
                startQuat = child.quaternion;
            }
        });
        this.startPos = startPos;
        this.startQuat = startQuat;
        scene.add(this.mapScene);
    }

    beginPlay() {
        //create map physics
        //const mapCollision = new Ammo.btTriangleMesh(true, true);


        this.mapScene.traverse(function (child) {
            if(child.isMesh) {
                const collideMesh = new Ammo.btTriangleMesh(true, true);
                let geom = new THREE.Geometry().fromBufferGeometry(child.geometry); //confirmed
                let vertices = geom.vertices;
                let indices = geom.indices;
                //mesh.setScaling(new Ammo.btVector3(scale[0], scale[1], scale[2]));
                for(let i = 0; i * 3 < indices.length; i++) {
                    mesh.addTriangle(
                        new Ammo.btVector3(vertices[indices[i * 3] * 3], vertices[indices[i * 3] * 3 + 1], vertices[indices[i * 3] * 3 + 2]),
                        new Ammo.btVector3(vertices[indices[i * 3 + 1] * 3], vertices[indices[i * 3 + 1] * 3 + 1], vertices[indices[i * 3 + 1] * 3 + 2]),
                        new Ammo.btVector3(vertices[indices[i * 3 + 2] * 3], vertices[indices[i * 3 + 2] * 3 + 1], vertices[indices[i * 3 + 2] * 3 + 2]),
                        false
                    );
                }
                const collideShape = new Ammo.btBvhTriangleMeshShape(collideMesh, true, true);
                const localInertia = new Ammo.btVector3(0, 0, 0);
                const object = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(0, motionState, collideShape, localInertia));
                physicsWorld.addRigidBody(object);
            }
        });

        localPlayer = new Kart(this.startPos);

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
        plane.position.set(0.0, -2.0, 0.0);
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
    }
}
export async function loadMap(file) {
    var mapModel = await loadModel(file);
    return new Map(mapModel.scene);
}