import { loadModel } from './res.mjs';
//https://stackoverflow.com/questions/59665854/ammo-js-custom-mesh-collision-with-sphere
class Map {
    constructor(mapScene) {
        this.mapScene = mapScene;

        this.mapScene.scale.multiplyScalar(0.5);

        var startPos = new THREE.Vector3()
        var startQuat = new THREE.Quaternion();
        this.mapScene.traverse((child) => {
            if(child.name === "course_start") {
                child.getWorldPosition(startPos);
                child.getWorldQuaternion(startQuat);
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
                let collideMesh = new Ammo.btTriangleMesh(true, true);
                let childPos = new THREE.Vector3();
                let childQuat = new THREE.Quaternion();
                let childScale = new THREE.Vector3();
                child.getWorldPosition(childPos);
                child.getWorldQuaternion(childQuat);
                child.getWorldScale(childScale);
                //collideMesh.setScaling(pvec(child.scale)); //.getWorldScale
                collideMesh.setScaling(pvec(childScale));

                const mapTransform = new Ammo.btTransform();
                mapTransform.setIdentity();
                mapTransform.setOrigin(pvec(childPos));
                mapTransform.setRotation(pquat(childQuat));

                //let mapTransform = createTransform(child);
                let mapMotionState = new Ammo.btDefaultMotionState(mapTransform);

                let geom = new THREE.Geometry().fromBufferGeometry(child.geometry); //confirmed
                let vertices = geom.vertices;
                let faces = geom.faces;
                //console.log("mesh has " + faces.length + " faces");
                //console.log("face " + vertices[faces[0].a].x + " " + vertices[faces[0].a].y + " " + vertices[faces[0].a].z);
                //mesh.setScaling(new Ammo.btVector3(scale[0], scale[1], scale[2]));
                for(let i = 0; i < faces.length; i++) {
                    let face = faces[i];
                    collideMesh.addTriangle(
                        pvec(vertices[face.a]),
                        pvec(vertices[face.b]),
                        pvec(vertices[face.c]),
                        true //remove doubles
                    );
                }
                let collideShape = new Ammo.btBvhTriangleMeshShape(collideMesh, true, true);
                //let collideShape = new Ammo.btConvexTriangleMeshShape(collideMesh, true);
                collideShape.setMargin( 0.15 );
                let localInertia = new Ammo.btVector3(0, 0, 0);
                collideShape.calculateLocalInertia( 0.0, localInertia );
                let object = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(0.0, mapMotionState, collideShape, localInertia));
                
                object.setCollisionFlags(object.collisionFlags | CF_CUSTOM_MATERIAL_CALLBACK);

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