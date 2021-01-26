//https://github.com/kripken/ammo.js/blob/master/examples/webgl_demo_vehicle/index.html

class Wheel {
    constructor(isFront, vehicle, pos, radius, width, tuning) {
        this.driftDir = 0;
        this.HalfTrack = 1;
        this.radius = radius;
        this.width = width;

        this.friction = 1000; //1000
        var suspensionStiffness = 2.0;
        var suspensionDamping = 2.3; //2.3
        var suspensionCompression = 4.4;
        var suspensionRestLength = 0.3; //0.6 0.3
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
    constructor(startPos) {
        this.drifting = false;
        this.steeringClampL = steeringClamp;
        this.steeringClampR = steeringClamp;
        //vehicle variables
        var chassisWidth = 1.0; //1.8
        var chassisHeight = .2; //.6
        var chassisLength = 2.2; //2
        var massVehicle = 800; //800

        var wheelAxisBackPosition = -1;
        var wheelAxisHeightBack = .3;

        var wheelAxisFrontPosition = 1.7;
        var wheelAxisHeightFront = .3;

        const frontWheelWidth = 0.3;
        const backWheelWidth = 0.4;
        const mass = 800;
        //const box = new THREE.BoxGeometry(chassisWidth, chassisHeight, chassisLength, 1, 1, 1);
        //let mesh = new THREE.Mesh( box, new THREE.MeshStandardMaterial( { color: 0x0000ff } ) );
        //mesh.add(camera);
        //scene.add(mesh);

        var FrontLeftPosition   = new Ammo.btVector3(0.5, wheelAxisHeightFront, wheelAxisFrontPosition),
            FrontRightPosition  = new Ammo.btVector3(-0.5, wheelAxisHeightFront, wheelAxisFrontPosition),
            BackLeftPosition    = new Ammo.btVector3(0.5, wheelAxisHeightBack, wheelAxisBackPosition),
            BackRightPosition   = new Ammo.btVector3(-0.5, wheelAxisHeightBack, wheelAxisBackPosition);
        
        console.log(Object.keys(gameModels).length + "LOADED MODELS");
        var mesh = gameModels.standardKart.scene.clone();//.clone();

        mesh.traverse(function (child) {
            if(child.name === "wheel_bl") {
                child.position.x += backWheelWidth / 2;
                BackLeftPosition = pvec(child.position);
            }
            else if(child.name === "wheel_br") {
                child.position.x -= backWheelWidth / 2;
                BackRightPosition = pvec(child.position);
            }
            else if(child.name === "wheel_fl") {
                child.position.x += frontWheelWidth / 2;
                FrontLeftPosition = pvec(child.position);
            }
            else if(child.name === "wheel_fr") {
                child.position.x -= frontWheelWidth / 2;
                FrontRightPosition = pvec(child.position);
            }

                // if (child.isMesh) {
                    
                //     //child.material = material;
                // }
        });

        this.cameraTarget = new THREE.Object3D();
        this.cameraTarget.position.y = 2;
        this.cameraTarget.position.z = -3;
        this.cameraTarget.lookAt(0.0, 0.4, 0.0);
        mesh.add(this.cameraTarget);

        mesh.add(camera);

        this.spark = new sparkParticleSystem();
        mesh.add(this.spark.particleSystem);

        scene.add(mesh);



        let transform = createTransform(mesh);

        var start = startPos.clone();
        //start.x = 0;
        //start.z = 0;
        //start.y = 100.0;
        //start.y += 4.0;
        start.y += 4.0;
        transform.setOrigin(pvec(start));

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
        
        this.wheels = [
            new Wheel(true, this.vehicle, FrontLeftPosition, .18, frontWheelWidth, tuning),
            new Wheel(true, this.vehicle, FrontRightPosition, .18, frontWheelWidth, tuning),
            new Wheel(false, this.vehicle, BackLeftPosition, .22, backWheelWidth, tuning),
            new Wheel(false, this.vehicle, BackRightPosition, .22, backWheelWidth, tuning)
        ];

        //keep upright physics
        var c = new Ammo.btTransform();
        c.setIdentity();
        c.getBasis().setEulerZYX(-Math.PI / 2, 0, 0);
        var uprightConstraint = new Ammo.btGeneric6DofConstraint(this.gameObject.rigidBody, c, false);
        uprightConstraint.setLinearLowerLimit(new Ammo.btVector3(1.0, 1.0, 1.0));
        uprightConstraint.setLinearUpperLimit(new Ammo.btVector3(0.0, 0.0, 0.0));

        uprightConstraint.setAngularLowerLimit(new Ammo.btVector3(1.0, 0.0, 1.0));
        uprightConstraint.setAngularUpperLimit(new Ammo.btVector3(0.0, 0.0, 0.0));
        physicsWorld.addConstraint(uprightConstraint);

        thinkers.push(this);
        objects.push(this);
    }
    update() {
        var tm, p, q;
        for(let i = 0; i < this.wheels.length; i++) {
            tm = this.vehicle.getWheelTransformWS(i);
            p = tm.getOrigin();
            q = tm.getRotation();
            this.wheels[i].mesh.position.set( p.x(), p.y(), p.z() );
            this.wheels[i].mesh.quaternion.set( q.x(), q.y(), q.z(), q.w() );
        }
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
            const slipFriction = 30;
            this.wheels[2].wheelInfo.set_m_frictionSlip(slipFriction);
            this.wheels[3].wheelInfo.set_m_frictionSlip(slipFriction);

            //this.wheels[2].wheelInfo
            this.gameObject.rigidBody.applyCentralImpulse(new Ammo.btVector3(forward.x, 1000.0, forward.z));
        }
        else if(!bDrift && this.drifting) {
            this.drifting = false;
            this.driftDir = 0;
            this.wheels[2].wheelInfo.set_m_frictionSlip(this.wheels[2].friction);
            this.wheels[3].wheelInfo.set_m_frictionSlip(this.wheels[3].friction);
            this.steeringClampL = steeringClamp;
            this.steeringClampR = steeringClamp;
            this.vehicleSteering = Math.min(this.vehicleSteering, this.steeringClampL);
            this.vehicleSteering = Math.max(this.vehicleSteering, -this.steeringClampR);
        }

        //sidways drift movement
        if(this.drifting)
        {
            right.multiplyScalar(-1 * this.driftDir * speed);
            this.gameObject.rigidBody.applyCentralImpulse(pvec(right));
        }
        this.movementTick();
    }
}

var localPlayer;
var Players = [];