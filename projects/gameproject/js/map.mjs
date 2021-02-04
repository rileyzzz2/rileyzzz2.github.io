import { loadModel } from './res.mjs';
//https://stackoverflow.com/questions/59665854/ammo-js-custom-mesh-collision-with-sphere

function createFaceCollision(child, geom, faces) {
    let collideMesh = new Ammo.btTriangleMesh(false, true);
    let childPos = new THREE.Vector3();
    let childQuat = new THREE.Quaternion();
    let childScale = new THREE.Vector3();
    child.getWorldPosition(childPos);
    child.getWorldQuaternion(childQuat);
    child.getWorldScale(childScale);
    collideMesh.setScaling(pvec(childScale));
    //collideMesh.setLocalScaling(pvec(childScale));

    const mapTransform = new Ammo.btTransform();
    mapTransform.setIdentity();
    mapTransform.setOrigin(pvec(childPos));
    mapTransform.setRotation(pquat(childQuat));

    //let mapTransform = createTransform(child);
    let mapMotionState = new Ammo.btDefaultMotionState(mapTransform);

    let vertices = geom.vertices;
    for(let i = 0; i < faces.length; i++)
    {
        let face = faces[i];
        collideMesh.addTriangle(
            pvec(vertices[face.a]),
            pvec(vertices[face.b]),
            pvec(vertices[face.c]),
            false //remove doubles
        );
    }
    

    let collideShape = new Ammo.btBvhTriangleMeshShape(collideMesh, true, true);
    mapCollisionData[collideShape] = geom;
    //let collideShape = new Ammo.btConvexTriangleMeshShape(collideMesh, true);
    //let collideShape = collideMesh;

    collideShape.setMargin( 0.1 );

    let localInertia = new Ammo.btVector3(0, 0, 0);
    collideShape.calculateLocalInertia( 0.0, localInertia );
    let object = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(0.0, mapMotionState, collideShape, localInertia));
    
    //object.setCollisionFlags(object.collisionFlags | CF_CUSTOM_MATERIAL_CALLBACK);
    object.setContactProcessingThreshold(0.0);
    
    physicsWorld.addRigidBody(object);
}

class Map {
    constructor(mapScene, collisionScene, objectData) {
        this.mapScene = mapScene;
        this.collisionScene = collisionScene;

        this.mapScene.scale.multiplyScalar(0.35); // 0.5
        this.collisionScene.scale.multiplyScalar(0.35);

        var startEmpty;
        //var startPos = new THREE.Vector3()
        var startQuat = new THREE.Quaternion();
        this.mapScene.traverse((child) => {
            if(child.name === "course_start") {
                startEmpty = child;
                //child.getWorldPosition(startPos);
                child.getWorldQuaternion(startQuat);
            }
            if(child.isMesh) {
                child.material.roughness = 0.9;
            }
        });
        //this.startPos = startPos;
        this.startQuat = startQuat;
        scene.add(this.mapScene);


        //create start positions
        this.startPositions = [];
        for(let i = 0; i < 3; i++) {
            for(let j = 0; j < 4; j++) {
                let start = new THREE.Object3D();
                start.add(gameModels.stopper.scene.clone());
                start.position.x = ((j / 4.0) - 0.5) * -35.0 - 2.5;
                start.position.z = i * -20.0 - (j / 4.0 * 5.0);
                startEmpty.add(start);
                this.startPositions.push(start);
            }
        }

        //create items
        this.items = [];
        for(let i = 0; i < objectData.items.length; i++) {
            let item = objectData.items[i];
            let itempos = item.position;
            if(item.type === "coin")
                this.items.push(new Coin(itempos, i));
            else if(item.type === "itembox")
                this.items.push(new ItemBox(itempos, i));
        }
        //scene.add(this.collisionScene);
    }

    beginPlay() {
        //create map physics
        //const mapCollision = new Ammo.btTriangleMesh(true, true);

        this.collisionScene.traverse(function (child) {
            //let isRelevant = (child.name === "polygon147" || child.name === "polygon145");
            //isRelevant = false;
            if(child.isMesh) {
                let exp = /([a-z]+)_.*/g;
                let materialGroup = exp.exec(child.material.name)[1];
                //console.log("material group " + child.material.name);
                if(materialGroup === "wall" ||materialGroup === "road" || materialGroup === "offroad" || materialGroup === "fast") {
                    let geom = new THREE.Geometry().fromBufferGeometry(child.geometry); //confirmed
                    let faces = geom.faces;
                    createFaceCollision(child, geom, faces);
                }
            
            }
        });

        //create karts
        var startPos = new THREE.Vector3();
        //use player index from the server
        this.startPositions[localPlayerIndex].getWorldPosition(startPos);
        localPlayer = new Kart(startPos, this.startQuat);

        for(const client in remoteConnections)
            Players.push(new NPCKart(remoteConnections[client].conn));
        
        
        //camera.parent = localPlayer.gameObject.mesh;
        //camera.position.x = -2;

        //third person
        camera.position.y = 2;
        camera.position.z = -3;
        camera.lookAt(0.0, 0.4, 0.0);

        //first person
        // camera.position.y = 0.9;
        // camera.position.z = -0.2;
        // camera.rotation.y = Math.PI;

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
export async function loadMap(file, collisionFile, JSONfile) {
    var mapModel = await loadModel(file);
    var collisionModel = await loadModel(collisionFile);
    var JSONdata;
    await $.getJSON(JSONfile, function( data ) {JSONdata = data;});
    return new Map(mapModel.scene, collisionModel.scene, JSONdata);
}