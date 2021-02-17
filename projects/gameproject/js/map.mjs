import { loadModel } from './res.mjs';
import { gameFinish } from './game.mjs';
import { refreshPlayerList } from './network.mjs';

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

    //collideShape.setMargin( 0.1 );
    collideShape.setMargin( 0.15 );

    let localInertia = new Ammo.btVector3(0, 0, 0);
    collideShape.calculateLocalInertia( 0.0, localInertia );
    let object = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(0.0, mapMotionState, collideShape, localInertia));
    
    //object.setCollisionFlags(object.collisionFlags | CF_CUSTOM_MATERIAL_CALLBACK);
    object.setRestitution(1.0);
    object.setContactProcessingThreshold(0.0);
    
    physicsWorld.addRigidBody(object);
}

class Map {
    constructor(mapScene, collisionScene, objectData, scale) {
        this.mapScene = mapScene;
        this.collisionScene = collisionScene;
        this.objectData = objectData;

        this.mapScene.scale.multiplyScalar(0.35 * scale); // 0.5
        this.collisionScene.scale.multiplyScalar(0.35 * scale);

        var startEmpty;
        //var startPos = new THREE.Vector3()
        var startQuat = new THREE.Quaternion();
        this.mapScene.traverse((child) => {
            if(child.name === "course_start") {
                startEmpty = child;
                //child.getWorldPosition(startPos);
                child.getWorldQuaternion(startQuat);

                child.getWorldPosition(mapStart);

                console.log("map start " + mapStart.x + " " + mapStart.y + " " + mapStart.z);
            }
            if(child.isMesh) {
                child.material.roughness = 0.9;

                //child.castShadow = true;
                child.receiveShadow = true;
                //child.material.emissive = new THREE.Color(0xffffff);
                //child.material = new THREE.MeshPhongMaterial({map: child.material.map, alphaMap: child.material.alphaMap});
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
                start.position.x = ((j / 4.0) - 0.5) * -35.0 - 4.0;
                start.position.z = i * -20.0 - (j / 4.0 * 5.0);
                startEmpty.add(start);
                this.startPositions.push(start);
            }
        }

        //scene.add(this.collisionScene);
    }

    beginPlay() {
        //create map physics
        //const mapCollision = new Ammo.btTriangleMesh(true, true);

        //create items
        this.items = [];
        for(let i = 0; i < this.objectData.items.length; i++) {
            let item = this.objectData.items[i];
            let itempos = item.position;
            if(item.type === "coin")
                this.items.push(new Coin(itempos, i));
            else if(item.type === "itembox")
                this.items.push(new ItemBox(itempos, i));
        }

        this.maxLapProgressStep = 0.0;
        this.maxGlobalDist = 0.0;
        //process path data
        this.tracksegments = [];
        for(let i = 0; i < this.objectData.trackpaths.length; i++) {
            let segment = this.objectData.trackpaths[i];
            for(var j = 0; j < segment.last.length; j++) {
                let last = segment.last[j];
                const points = [];

                if(last === -1)
                    points.push( mapStart );
                else {
                    let lastSegment = this.objectData.trackpaths[last];
                    points.push( new THREE.Vector3( lastSegment.position[0], lastSegment.position[1], lastSegment.position[2] ) );
                }

                points.push( new THREE.Vector3( segment.position[0], segment.position[1], segment.position[2] ) );

                var that = this;
                function recursiveGetDistance(index, dist) {
                    if(index === -1)
                        return 0.0;
                    
                    let curSegment = that.objectData.trackpaths[index];
                    let endSegment = new THREE.Vector3( curSegment.position[0], curSegment.position[1], curSegment.position[2] );
                    let distances = [];
                    for(let k = 0; k < curSegment.last.length; k++) {
                        let startIndex = curSegment.last[k];
                        let startSegment;
                        if(startIndex === -1)
                            startSegment = mapStart;
                        else {
                            let lastSegment = that.objectData.trackpaths[startIndex];
                            startSegment = new THREE.Vector3( lastSegment.position[0], lastSegment.position[1], lastSegment.position[2] );
                        }

                        let segDist = dist + startSegment.distanceTo(endSegment);
                        segDist += recursiveGetDistance(startIndex, segDist);
                        distances.push(segDist);
                    }
                    let minDist = 0.0;
                    if(distances.length > 0) {
                        minDist = distances[0];
                        for(let k = 0; k < distances.length; k++)
                            minDist = Math.min(minDist, distances[k]);
                    }

                    return minDist;
                }

                this.maxLapProgressStep = Math.max(this.maxLapProgressStep, points[0].distanceTo(points[1]));
                var globalDist = recursiveGetDistance(last, 0.0);
                var length = points[0].distanceTo(points[1])
                this.tracksegments.push({
                    line: new THREE.Line3(points[0], points[1]),
                    globalDist: globalDist,
                    length: length
                    //dist: points[0].distanceTo(pos)
                });
                this.maxGlobalDist = Math.max(this.maxGlobalDist, globalDist + length);
            }
        }

        this.maxLapProgressStep = 3000.0;

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

        thinkers.push(this);
    }

    findClosestTrackPoint(pos) {
        var segments = [...this.tracksegments];
        for(let i = 0; i < segments.length; i++)
            segments[i].dist = segments[i].line.start.distanceTo(pos);

        segments.sort((a, b) => { return a.dist - b.dist; });

        var closest = segments.slice(0, 3);

        var closestDist = 1000.0;
        var closestSegment;
        var closestKey = 0.0;
        for(let i = 0; i < closest.length; i++) {
            let line = closest[i].line;
            let closestPoint = new THREE.Vector3();
            let key = line.closestPointToPointParameter(pos, true);
            line.at(key, closestPoint);

            let dist = pos.distanceTo(closestPoint);
            closestDist = Math.min(closestDist, dist);
            if(closestDist === dist) {
                closestSegment = closest[i];
                closestKey = key;
            }
        }

        if(closestSegment) {
            //console.log("closest global distance " + closestSegment.globalDist);
            return {
                segment: closestSegment,
                key: closestKey
            };
        }
    }

    getTrackDistance(pos) {
        var obj = this.findClosestTrackPoint(pos);
        var segment = obj.segment;
        var key = obj.key;
        //console.log("key " + key + " length " + segment.line.distance());
        //$("#coinCount").text(segment.globalDist + segment.line.distance() * key);
        return segment.globalDist + segment.line.distance() * key;
    }
    tick() {
        if(isHost) {
            
            //trackPlayers.push(localPlayer);
            var placement = [];
            for(let i = 0; i < Players.length; i++) {
                let p = Players[i];
                let pos = p.mesh.position;

                let playerDist = this.getTrackDistance(pos);
                var lastProgress = p.lapProgress;

                if(p.lapProgress <= 1.0 && playerDist > 100.0)
                    playerDist = 0.0;
                
                if(p.lapProgress + this.maxLapProgressStep > playerDist)
                    p.lapProgress = playerDist;
                else
                    playerDist = p.lapProgress;

                if(playerDist === 0.0 && lastProgress > 100.0) {
                    //console.log("lap " + p.lap);
                    p.lapIncrement();
                    if(p.lap === 3) {
                        winners.push(p.conn.peer);
                        refreshPlayerList();
                    
                        var data = {
                            type: "updateWinners",
                            winners: winners
                        };

                        for(const client in remoteConnections)
                            remoteConnections[client].conn.send(data);
                    }
                }

                placement.push([(p.lap * this.maxGlobalDist) + playerDist, p]);
            }
            var localDist = this.getTrackDistance(localPlayer.gameObject.mesh.position);
            var lastProgress = localPlayer.lapProgress;
            if(localPlayer.lapProgress <= 1.0 && localDist > 100.0)
                    localDist = 0.0;
            
            if(localPlayer.lapProgress + this.maxLapProgressStep > localDist)
                    localPlayer.lapProgress = localDist;
                else
                    localDist = localPlayer.lapProgress;
            
            var lastSegment = this.tracksegments[this.tracksegments.length - 1];
            if(localDist === 0.0 && lastProgress > lastSegment.globalDist) {
                lapIncrement();
                if(localPlayer.lap === 3) {
                    winners.push(hostID);
                    refreshPlayerList();

                    var data = {
                        type: "updateWinners",
                        winners: winners
                    };

                    for(const client in remoteConnections)
                        remoteConnections[client].conn.send(data);
                }
            }
            
            placement.push([(localPlayer.lap * this.maxGlobalDist) + localDist, localPlayer]);

            placement.sort((a, b) => { return b[0] - a[0]; });
            //console.log("placement count " + placement.length);
            for(let i = 0; i < placement.length; i++) {
                let p = placement[i][1];
                var place = i + 1;
                //console.log("place " + place);
                if(p.placement !== place)
                    p.setPlacement(place);
            }
            //console.log("track dist " + this.getTrackDistance(localPlayer.gameObject.mesh.position));
            //this.findClosestTrackPoint(localPlayer.gameObject.mesh.position);
        }
    }
}
export async function loadMap(file, collisionFile, JSONfile, scale=1.0) {
    var mapModel = await loadModel(file);
    var collisionModel = await loadModel(collisionFile);
    var JSONdata;
    await $.getJSON(JSONfile, function( data ) {JSONdata = data;});
    return new Map(mapModel.scene, collisionModel.scene, JSONdata, scale);
}