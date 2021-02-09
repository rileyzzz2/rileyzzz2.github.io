//https://github.com/kripken/ammo.js/blob/master/examples/webgl_demo_vehicle/index.html

class Wheel {
    constructor(isFront, vehicle, pos, radius, width, tuning) {
        this.driftDir = 0;
        this.HalfTrack = 1;
        this.radius = radius;
        this.width = width;

        this.friction = 2000; //1000
        var suspensionStiffness = 20.0;
        var suspensionDamping = 2.3; //2.3
        var suspensionCompression = 1.4;
        var suspensionRestLength = 0.2; //0.6 0.3
        var rollInfluence = 0.2;

        var wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0);
        var wheelAxleCS = new Ammo.btVector3(-1, 0, 0);
        
        this.wheelInfo = vehicle.addWheel(
							pos,
							wheelDirectionCS0,
							wheelAxleCS,
							suspensionRestLength,
							radius,
							tuning,
                            isFront);
        
        this.wheelInfo.set_m_suspensionStiffness(suspensionStiffness);
		this.wheelInfo.set_m_wheelsDampingRelaxation(suspensionDamping);
		this.wheelInfo.set_m_wheelsDampingCompression(suspensionCompression);
		this.wheelInfo.set_m_frictionSlip(this.friction);
        this.wheelInfo.set_m_rollInfluence(rollInfluence);
        
        var wheelMat = new THREE.MeshStandardMaterial( { color: 0xffffff } );

        
        //var t = new THREE.CylinderGeometry(radius, radius, width, 24, 1);
        //t.rotateZ(Math.PI / 2);
		//var cyl = new THREE.Mesh(t, wheelMat);
        //this.mesh.add(new THREE.Mesh(new THREE.BoxGeometry(width * 1.5, radius * 1.75, radius*.25, 1, 1, 1), wheelMat));

        this.mesh = new THREE.Group();
        var wheelMesh = gameModels.slickWheel.scene.clone();
        //console.log("wheel x " + pos.x());
        if(pos.x() > 0.0)
            wheelMesh.rotation.set(0.0, 0.0, Math.PI);
        if(!isFront)
            wheelMesh.scale.set(1.2, 1.2, 1.2);
        this.mesh.add(wheelMesh);
        //this.mesh.add(cyl);

		scene.add(this.mesh);
    }
}

const steeringClamp = .25;
class Kart {
    constructor(startPos, startQuat) {
        this.placement = 0;
        this.collectedCoins = 0;
        this.heldItem = ITEM_NONE;
        this.itemAnimating = false;
        this.hitAnimating = false;
        this.itemAnim = 0.0;

        this.drifting = false;
        this.driftTime = 0.0;
        this.steeringClampL = steeringClamp;
        this.steeringClampR = steeringClamp;
        //vehicle variables
        var chassisWidth = 1.0; //1.8
        var chassisHeight = .2; //.6
        var chassisLength = 2.2; //2
        //var massVehicle = 400; //800




        const mass = 800;
        //const box = new THREE.BoxGeometry(chassisWidth, chassisHeight, chassisLength, 1, 1, 1);
        //let mesh = new THREE.Mesh( box, new THREE.MeshStandardMaterial( { color: 0x0000ff } ) );
        //mesh.add(camera);
        //scene.add(mesh);

        // publish({
        //     type: "registerKart"
        // });

        var mesh = gameModels.standardKart.scene.clone();//.clone();

        this.playerModel = SkelUtils.clone(playerModels.mario.scene);
        //this.playerModel.scale.multiplyScalar(10.0);

        this.playerMixer = new THREE.AnimationMixer( this.playerModel );
        var that = this;
        let clips = playerModels.mario.animations;
		clips.forEach(function (clip) {
			that.playerMixer.clipAction(clip).play();
        });
        this.playerMixer.setTime(0.5);
        mesh.add(this.playerModel);


        this.cameraTarget = new THREE.Object3D();
        this.cameraTarget.position.y = 2;
        this.cameraTarget.position.z = -3;
        this.cameraTarget.lookAt(0.0, 0.4, 0.0);
        mesh.add(this.cameraTarget);

        this.sparkTarget_L = new THREE.Object3D();
        this.sparkTarget_L.position.x = 0.4;
        this.sparkTarget_L.position.y = 0;
        this.sparkTarget_L.position.z = -0.7;
        mesh.add(this.sparkTarget_L);
        
        this.sparkTarget_R = new THREE.Object3D();
        this.sparkTarget_R.position.x = -0.4;
        this.sparkTarget_R.position.y = 0;
        this.sparkTarget_R.position.z = -0.7;
        mesh.add(this.sparkTarget_R);

        this.dropTarget = new THREE.Object3D();
        this.dropTarget.position.y = -0.1;
        this.dropTarget.position.z = -1.6;
        mesh.add(this.dropTarget);

        mesh.add(camera);

        this.sparks_L = new sparkParticleSystem();
        this.sparks_L.setEmissionRate(0.0);

        this.sparks_R = new sparkParticleSystem();
        this.sparks_R.setEmissionRate(0.0);
        //mesh.add(this.spark.particleGroup.mesh);
        
        scene.add(mesh);



        let transform = createTransform(mesh);

        var start = startPos.clone();
        //start.x = 0;
        //start.y = 0;
        //start.z = 0;
        //start.y = 100.0;
        //start.y += 4.0;
        start.y += 1.0;
        transform.setOrigin(pvec(start));
        transform.setRotation(pquat(startQuat));

        let motionState = new Ammo.btDefaultMotionState( transform );
        var localInertia = new Ammo.btVector3( 0, 0, 0 );
        var shape = new Ammo.btBoxShape(new Ammo.btVector3(chassisWidth * .5, chassisHeight * .5, chassisLength * .5));
        shape.setMargin( 0.04 );

        shape.calculateLocalInertia( mass, localInertia );
        var body = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo( mass, motionState, shape, localInertia ));
        body.setCollisionFlags(body.collisionFlags | CF_CUSTOM_MATERIAL_CALLBACK);
        body.setContactProcessingThreshold(0.0);

        physicsWorld.addRigidBody(body);

        this.gameObject = new GameObject(mesh, body);
        objects.push(this.gameObject);

        // Raycast Vehicle
        this.engineForce = 0;
        this.vehicleSteering = 0;
        this.breakingForce = 0;
        var tuning = new Ammo.btVehicleTuning();
        var rayCaster = new Ammo.btDefaultVehicleRaycaster(physicsWorld);
        this.vehicle = new Ammo.btRaycastVehicle(tuning, body, rayCaster);
        this.vehicle.setCoordinateSystem(0, 1, 2);
        physicsWorld.addAction(this.vehicle);
        
        //move somewhere later
        const frontWheelWidth = 0.3;
        const backWheelWidth = 0.4;

        this.wheels = [
            new Wheel(true, this.vehicle, kartData.standardKart.FrontLeftPosition, .18, frontWheelWidth, tuning),
            new Wheel(true, this.vehicle, kartData.standardKart.FrontRightPosition, .18, frontWheelWidth, tuning),
            new Wheel(false, this.vehicle, kartData.standardKart.BackLeftPosition, .22, backWheelWidth, tuning),
            new Wheel(false, this.vehicle, kartData.standardKart.BackRightPosition, .22, backWheelWidth, tuning)
        ];

        //keep upright physics
        var c = new Ammo.btTransform();
        c.setIdentity();
        c.getBasis().setEulerZYX(-Math.PI / 2, 0, 0);
        var uprightConstraint = new Ammo.btGeneric6DofConstraint(this.gameObject.rigidBody, c, false);
        uprightConstraint.setLinearLowerLimit(new Ammo.btVector3(1.0, 1.0, 1.0));
        uprightConstraint.setLinearUpperLimit(new Ammo.btVector3(0.0, 0.0, 0.0));

        //uprightConstraint.setAngularLowerLimit(new Ammo.btVector3(0.01, 0.0, 1.0));
        uprightConstraint.setAngularLowerLimit(new Ammo.btVector3(-0.8, 0.0, 1.0));
        uprightConstraint.setAngularUpperLimit(new Ammo.btVector3(0.8, 0.0, 0.0));
        physicsWorld.addConstraint(uprightConstraint);

        thinkers.push(this);
        networkThinkers.push(this); //replicated
        objects.push(this);
    }

    playItemAnimation() {
        this.itemAnimating = true;
        this.itemAnim = 0.0;
    }

    //hit effects
    async stopHit() {
        this.hitAnimating = true;
    }

    useItem() {
        var dropPos = new THREE.Vector3();
        this.dropTarget.getWorldPosition(dropPos);

        activeMap.items.push(new itemBanana(dropPos));
        // switch(this.heldItem) {
        //     case ITEM_BANANA:
        //     new itemBanana(dropPos);
        //     break;
        //     default:
        //         new itemBanana(dropPos);
        //     case ITEM_NONE:
        //         break;
        // }
    }

    setPlacement(place) {
        this.placement = place;
        //console.log("setting local placement to " + place);
        setUIPlacement(place);
    }
    // setAnimationFrame(frame) {
    //     console.log("setting frame to " + frame);
    //     this.playerMixer.time = 0;
    //     for(var i = 0; i < this.playerMixer._actions.length; i++)
    //         this.playerMixer._actions[i].time = 0;
        
    //     this.playerMixer.update(frame);
    // }
    startDrifting() {
        this.driftTime = 0.0;
        this.drifting = true;
        if(bMoveLeft) {
            this.driftDir = -1;
            this.steeringClampL = 0.2;
            this.steeringClampR = -0.05;
        }
        else if(bMoveRight) {
            this.driftDir = 1;
            this.steeringClampL = -0.05;
            this.steeringClampR = 0.2;
        }

        this.vehicleSteering = Math.min(this.vehicleSteering, this.steeringClampL);
        this.vehicleSteering = Math.max(this.vehicleSteering, -this.steeringClampR);
        //this.vehicleSteering = Math.min(this.vehicleSteering, this.steeringClamp);
        //this.vehicleSteering = Math.max(this.vehicleSteering, -this.steeringClamp);

        //apply slip friction to back wheels
        const slipFriction = 200;
        this.wheels[2].wheelInfo.set_m_frictionSlip(slipFriction);
        this.wheels[3].wheelInfo.set_m_frictionSlip(slipFriction);
        //this.wheels[2].wheelInfo
        //this.gameObject.rigidBody.applyCentralImpulse(new Ammo.btVector3(forward.x, 1000.0, forward.z)); //1000.0
        this.gameObject.rigidBody.applyCentralImpulse(new Ammo.btVector3(0.0, 1000.0, 0.0)); //1000.0
    }
    stopDrifting() {
        this.drifting = false;
        this.driftDir = 0;
        this.wheels[2].wheelInfo.set_m_frictionSlip(this.wheels[2].friction);
        this.wheels[3].wheelInfo.set_m_frictionSlip(this.wheels[3].friction);
        this.steeringClampL = steeringClamp;
        this.steeringClampR = steeringClamp;
        this.vehicleSteering = Math.min(this.vehicleSteering, this.steeringClampL);
        this.vehicleSteering = Math.max(this.vehicleSteering, -this.steeringClampR);
        //this.sparks_L.setEmissionRate(0.0);
        //this.sparks_R.setEmissionRate(0.0);
        this.sparks_L.setDriftTime(0.0);
        this.sparks_R.setDriftTime(0.0);
    }
    update(dt) {
        //this.playerMixer.update(dt);
        if(this.itemAnimating) {
            this.itemAnim += dt;

            if(this.itemAnim > 4.0) {
                this.itemAnimating = false;
                setItemIcon(this.heldItem);
            } else {
                //console.log("item anim " + Math.floor((this.itemAnim * 4.0) % ITEM_MAX));
                setItemIcon(Math.floor((this.itemAnim * 8.0) % ITEM_MAX));
            }
        }

        var targetPos_L = new THREE.Vector3(0.0, 0.0, 0.0);
        var targetPos_R = new THREE.Vector3(0.0, 0.0, 0.0);
        this.sparkTarget_L.getWorldPosition(targetPos_L);
        this.sparks_L.setPosition(targetPos_L);
        this.sparkTarget_R.getWorldPosition(targetPos_R);
        this.sparks_R.setPosition(targetPos_R);

        var tm, p, q;
        for(let i = 0; i < this.wheels.length; i++) {
            tm = this.vehicle.getWheelTransformWS(i);
            p = tm.getOrigin();
            q = tm.getRotation();
            this.wheels[i].mesh.position.set( p.x(), p.y(), p.z() );
            this.wheels[i].mesh.quaternion.set( q.x(), q.y(), q.z(), q.w() );
        }

        if(this.drifting)
            this.driftTime += dt;
    }
    movementTick() {
        const steeringIncrement = .04;
        const maxEngineForce = 3000; //2000 3000
        const maxBreakingForce = 200;

        var speed = this.vehicle.getCurrentSpeedKmHour();
        this.engineForce = 0;
        this.breakingForce = 0;
        
        if(bMoveForward) {
            if (speed < -1)
				this.breakingForce = maxBreakingForce;
			else this.engineForce = maxEngineForce;
        }
        if(bMoveBackward) {
            if (speed > 1)
				this.breakingForce = maxBreakingForce;
			else this.engineForce = -maxEngineForce / 2;
        }
        if(bMoveLeft) {
            if (this.vehicleSteering < this.steeringClampL)
				this.vehicleSteering += steeringIncrement;
        }
        else if(bMoveRight){
            if (this.vehicleSteering > -this.steeringClampR)
				this.vehicleSteering -= steeringIncrement;
        }
        else { //return steering to default
            if(!this.drifting) {
                if (this.vehicleSteering < -steeringIncrement)
                    this.vehicleSteering += steeringIncrement;
                else if (this.vehicleSteering > steeringIncrement)
                    this.vehicleSteering -= steeringIncrement;
                else
                    this.vehicleSteering = 0;
            }
        }

        //top speed
        if(speed > 45.0 || speed < -30.0)
            this.engineForce = 0;

        const FRONT_LEFT = 0;
        const FRONT_RIGHT = 1;
        const BACK_LEFT = 2;
        const BACK_RIGHT = 3;

        //console.log("engine " + this.engineForce + " brake " + this.breakingForce);
        //apply force to back wheels
        this.vehicle.applyEngineForce(this.engineForce, BACK_LEFT);
        this.vehicle.applyEngineForce(this.engineForce, BACK_RIGHT);
        
        this.vehicle.applyEngineForce(this.engineForce / 2, FRONT_LEFT);
        this.vehicle.applyEngineForce(this.engineForce / 2, FRONT_RIGHT);
        
        this.vehicle.setBrake(this.breakingForce / 2, FRONT_LEFT);
		this.vehicle.setBrake(this.breakingForce / 2, FRONT_RIGHT);
		this.vehicle.setBrake(this.breakingForce, BACK_LEFT);
        this.vehicle.setBrake(this.breakingForce, BACK_RIGHT);
        
        this.vehicle.setSteeringValue(this.vehicleSteering, FRONT_LEFT);
        this.vehicle.setSteeringValue(this.vehicleSteering, FRONT_RIGHT);

        this.playerMixer.setTime(this.vehicleSteering * 1.2 + 0.5);

        //give a quick speed boost if we're stuck
        if(Math.abs(speed) < 1 && (bMoveForward || bMoveBackward)) {
            this.gameObject.rigidBody.forceActivationState(1);

            var forward = new THREE.Vector3();
            this.gameObject.mesh.getWorldDirection(forward);
            forward.normalize();
            forward.multiplyScalar(this.engineForce);
            this.gameObject.rigidBody.applyCentralImpulse(new Ammo.btVector3(forward.x, 100.0, forward.z));
        }
    }
    tick() {
        var speed = this.vehicle.getCurrentSpeedKmHour();
        var forward = new THREE.Vector3();
        this.gameObject.mesh.getWorldDirection(forward);
        var right = forward.clone();
        right.applyAxisAngle(new THREE.Vector3( 0, 1, 0 ), -Math.PI / 2);
        right.y = 0.0;
        right.normalize();

        forward.normalize();
        forward.multiplyScalar(500.0);
        if(bDrift && !this.drifting && speed > 1 && (bMoveLeft || bMoveRight)) {
            console.log("jump");
            this.startDrifting();
        }
        else if(this.drifting && (!bDrift || Math.abs(speed) < 1)) {
            this.stopDrifting();

            //speed boost based on drift time
            var driftMultiplier = 10.0;
            if(this.driftTime > 3.0)
                driftMultiplier *= 2.0;
            else if(this.driftTime > 1.5)
                driftMultiplier *= 1.5;
            else if (this.driftTime > 0.5)
                driftMultiplier *= 1.0;
            else
                driftMultiplier = 0.0;

            if(driftMultiplier > 0.0)
                this.gameObject.rigidBody.applyCentralImpulse(new Ammo.btVector3(forward.x * driftMultiplier, 100.0, forward.z * driftMultiplier));
        }

        //cancel drift
        // if(this.drifting && !this.isOnGround()) {
        //     this.stopDrifting();
        // }
        //this.isOnGround();

        //sidways drift movement
        if(this.drifting)
        {
            right.multiplyScalar(-1 * this.driftDir * speed * 8.0);
            this.gameObject.rigidBody.applyCentralImpulse(pvec(right));

            this.sparks_L.setDriftTime(this.driftTime);
            this.sparks_R.setDriftTime(this.driftTime);
        }
        this.movementTick();
    }

    replicate() {
        //replicate position and state to other clients
        var trans = new Ammo.btTransform();
        let ms = this.gameObject.rigidBody.getMotionState();
        if ( ms ) {
            ms.getWorldTransform( trans );
            let p = trans.getOrigin();
            let q = trans.getRotation();
            //console.log("sending signal " + p.x() + " " + Math.fround(p.x()).toString());
            //const precision = 2;
            // signal({
            //     type: "pt",
            //     //pos: [p.x().toFixed(precision).toString(), p.y().toFixed(precision).toString(), p.z().toFixed(precision).toString()],
            //     // rot: [Math.fround(q.x()), Math.fround(q.y()), Math.fround(q.z()), Math.fround(q.w())]
            //     x: p.x(),
            //     y: p.y(),
            //     z: p.z()
            // });

            var data = {
                type: "playerTick",
                pos: [p.x(), p.y(), p.z()],
                rot: [q.x(), q.y(), q.z(), q.w()],
                steering: this.vehicleSteering,
                wheelSpeed: this.wheels[2].wheelInfo.m_deltaRotation
            };

            for(const client in remoteConnections)
                remoteConnections[client].conn.send(data);

        }
    }
}

function lerp(a, b, f)
{
    return a + f * (b - a);
}

class NPCKart {
    constructor(conn) {
        this.conn = conn;
        this.targetPos = new THREE.Vector3();
        this.targetRot = new THREE.Quaternion();
        this.hasReceivedData = false;
        this.wheelSpeed = 0.0;
        this.placement = 0;
        // this.geometry = new THREE.BoxGeometry();
        // this.material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        // this.cube = new THREE.Mesh( this.geometry, this.material );
        this.mesh = gameModels.standardKart.scene.clone();

        this.playerModel = SkelUtils.clone(playerModels.mario.scene);
        //this.playerModel.scale.multiplyScalar(10.0);

        this.playerMixer = new THREE.AnimationMixer( this.playerModel );
        var that = this;
        let clips = playerModels.mario.animations;
		clips.forEach(function (clip) {
			that.playerMixer.clipAction(clip).play();
        });
        this.playerMixer.setTime(0.5);
        this.mesh.add(this.playerModel);

        this.wheels = [];
        var that = this;
        function addWheelMesh(pos, isFront) {
            var wheelgroup = new THREE.Group();
            var wheelMesh = gameModels.slickWheel.scene.clone();
            wheelgroup.add(wheelMesh);
            if(pos.x() > 0.0)
                wheelMesh.rotation.set(0.0, 0.0, Math.PI);
            if(!isFront)
                wheelMesh.scale.set(1.2, 1.2, 1.2);
            
            that.mesh.add(wheelgroup);
            let wheelpos = tvec(pos);
            wheelpos.y -= 0.05;
            wheelgroup.position.copy(wheelpos);

            that.wheels.push(wheelgroup);
        }

        addWheelMesh(kartData.standardKart.FrontLeftPosition, true);
        addWheelMesh(kartData.standardKart.FrontRightPosition, true);
        addWheelMesh(kartData.standardKart.BackLeftPosition, false);
        addWheelMesh(kartData.standardKart.BackRightPosition, false);

        scene.add( this.mesh );

        const mass = 0.0;
        let transform = createTransform(this.mesh);
        let motionState = new Ammo.btDefaultMotionState( transform );
        var localInertia = new Ammo.btVector3( 0, 0, 0 );
        var shape = new Ammo.btSphereShape(1.25);
        shape.setMargin( 0.05 );

        shape.calculateLocalInertia( mass, localInertia );
        var rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, shape, localInertia );
        this.rigidBody = new Ammo.btRigidBody( rbInfo );
        physicsWorld.addRigidBody(this.rigidBody);

        //that is necessary to prevent callback scope problems
        var that = this;
        this.conn.on('data', function(data) {
            that.handleData(data);
        });

        objects.push(this);
    }

    setPlacement(place) {
        this.placement = place;
        //console.log("setting npc placement to " + place);
        //network placement
        this.conn.send({
            type: "updatePlacement",
            place: place
        });
    }
    handleData(data) {
        if(data.type === "playerTick") {
            //console.log("received player tick!");
            // this.mesh.position.set( data.pos[0], data.pos[1], data.pos[2] );
            // this.mesh.quaternion.x = data.rot[0];
            // this.mesh.quaternion.y = data.rot[1];
            // this.mesh.quaternion.z = data.rot[2];
            // this.mesh.quaternion.w = data.rot[3];
            this.targetPos.set(data.pos[0], data.pos[1], data.pos[2]);
            this.targetRot.x = data.rot[0];
            this.targetRot.y = data.rot[1];
            this.targetRot.z = data.rot[2];
            this.targetRot.w = data.rot[3];
            this.wheelSpeed = data.wheelSpeed;
            this.targetSteering = data.steering;

            //set initial position
            if(!this.hasReceivedData) {
                this.mesh.position.set( data.pos[0], data.pos[1], data.pos[2] );
                this.mesh.quaternion.x = data.rot[0];
                this.mesh.quaternion.y = data.rot[1];
                this.mesh.quaternion.z = data.rot[2];
                this.mesh.quaternion.w = data.rot[3];
                var trans = new Ammo.btTransform();
                let ms = this.rigidBody.getMotionState();
                //ms.getWorldTransform(trans);
                trans.setOrigin(pvec(this.targetPos));
                trans.setRotation(pquat(this.targetRot));
                ms.setWorldTransform(trans);
                this.rigidBody.setMotionState(ms);
                this.hasReceivedData = true;
            }
            
        }
    }
    update(dt) {
        if(this.hasReceivedData) {
            const interpSpeed = 0.2; //0.05
            this.mesh.position.lerp(this.targetPos, interpSpeed);
            this.mesh.quaternion.slerp(this.targetRot, interpSpeed);

            var newTime = lerp(this.playerMixer.time, this.targetSteering * 1.2 + 0.5, 0.2);
            this.playerMixer.setTime(newTime);

            var trans = new Ammo.btTransform();
            let ms = this.rigidBody.getMotionState();
            //ms.getWorldTransform(trans);
            trans.setOrigin(pvec(this.targetPos));
            trans.setRotation(pquat(this.targetRot));
            ms.setWorldTransform(trans);
            this.rigidBody.setMotionState(ms);

            for(let i = 0; i < this.wheels.length; i++)
                this.wheels[i].rotation.x += this.wheelSpeed;
        }
    }
}