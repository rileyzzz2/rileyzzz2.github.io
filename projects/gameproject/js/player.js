//https://github.com/kripken/ammo.js/blob/master/examples/webgl_demo_vehicle/index.html

class Wheel {
    constructor(isFront, vehicle, pos, radius, width, tuning) {
        this.HalfTrack = 1;
        this.radius = radius;
        this.width = width;

        var friction = 1000;
        var suspensionStiffness = 20.0;
        var suspensionDamping = 2.3;
        var suspensionCompression = 4.4;
        var suspensionRestLength = 0.1; //0.6
        var rollInfluence = 0.2;

        var wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0);
        var wheelAxleCS = new Ammo.btVector3(-1, 0, 0);
        
        var wheelInfo = vehicle.addWheel(
							pos,
							wheelDirectionCS0,
							wheelAxleCS,
							suspensionRestLength,
							radius,
							tuning,
                            isFront);
        
        wheelInfo.set_m_suspensionStiffness(suspensionStiffness);
		wheelInfo.set_m_wheelsDampingRelaxation(suspensionDamping);
		wheelInfo.set_m_wheelsDampingCompression(suspensionCompression);
		wheelInfo.set_m_frictionSlip(friction);
        wheelInfo.set_m_rollInfluence(rollInfluence);
        
        var wheelMat = new THREE.MeshStandardMaterial( { color: 0xffffff } );
        var t = new THREE.CylinderGeometry(radius, radius, width, 24, 1);
        t.rotateZ(Math.PI / 2);
		this.mesh = new THREE.Mesh(t, wheelMat);
		this.mesh.add(new THREE.Mesh(new THREE.BoxGeometry(width * 1.5, radius * 1.75, radius*.25, 1, 1, 1), wheelMat));
		scene.add(this.mesh);
    }
}

class Kart {
    constructor() {
        this.drifting = false;
        //vehicle variables
        var chassisWidth = 1.0; //1.8
        var chassisHeight = .2; //.6
        var chassisLength = 2.2; //2
        var massVehicle = 800;

        var wheelAxisBackPosition = -1;
        var wheelAxisHeightBack = .3;

        var wheelAxisFrontPosition = 1.7;
        var wheelAxisHeightFront = .3;

        const wheelWidth = 0.4;
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
            console.log("gltf element " + child.name);
            if(child.name === "wheel_bl") {
                child.position.x += wheelWidth / 2;
                BackLeftPosition = pvec(child.position);
            }
            else if(child.name === "wheel_br") {
                child.position.x -= wheelWidth / 2;
                BackRightPosition = pvec(child.position);
            }
            else if(child.name === "wheel_fl") {
                child.position.x += wheelWidth / 2;
                FrontLeftPosition = pvec(child.position);
            }
            else if(child.name === "wheel_fr") {
                child.position.x -= wheelWidth / 2;
                FrontRightPosition = pvec(child.position);
            }

                // if (child.isMesh) {
                    
                //     //child.material = material;
                // }
        });
        mesh.add(camera);
        scene.add(mesh);



        let transform = createTransform(mesh);
        let motionState = new Ammo.btDefaultMotionState( transform );
        var localInertia = new Ammo.btVector3( 0, 0, 0 );
        var shape = new Ammo.btBoxShape(new Ammo.btVector3(chassisWidth * .5, chassisHeight * .5, chassisLength * .5));
        shape.setMargin( 0.05 );

        shape.calculateLocalInertia( mass, localInertia );
        var body = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo( mass, motionState, shape, localInertia ));
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
            new Wheel(true, this.vehicle, FrontLeftPosition, .2, wheelWidth, tuning),
            new Wheel(true, this.vehicle, FrontRightPosition, .2, wheelWidth, tuning),
            new Wheel(false, this.vehicle, BackLeftPosition, .3, wheelWidth, tuning),
            new Wheel(false, this.vehicle, BackRightPosition, .3, wheelWidth, tuning)
        ];

        //keep upright physics
        var c = new Ammo.btTransform();
        c.setIdentity();
        c.getBasis().setEulerZYX(-Math.PI / 2, 0, 0);
        var uprightConstraint = new Ammo.btGeneric6DofConstraint(this.gameObject.rigidBody, c, false);
        uprightConstraint.setLimit(0, 1.0, 0.0);
        uprightConstraint.setLimit(1, 1.0, 0.0);
        uprightConstraint.setLimit(2, 1.0, 0.0);
        uprightConstraint.setLimit(3, 1.0, 0.0);
        uprightConstraint.setLimit(4, 0.0, 0.0);
        uprightConstraint.setLimit(5, 1.0, 0.0);
        //physicsWorld.addConstraint(uprightConstraint);

        thinkers.push(this);
        objects.push(this);
    }
    update() {
        const steeringIncrement = .04;
        const steeringClamp = .3;
        const maxEngineForce = 2000; //2000
        const maxBreakingForce = 200;

        var speed = this.vehicle.getCurrentSpeedKmHour();
        this.engineForce = 0;
        this.breakingForce = 0;
        
        if(bMoveForward) {
            console.log("move forward");
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
            if (this.vehicleSteering < steeringClamp)
				this.vehicleSteering += steeringIncrement;
        }
        else if(bMoveRight){
            if (this.vehicleSteering > -steeringClamp)
				this.vehicleSteering -= steeringIncrement;
        }
        else { //return steering to default
            if (this.vehicleSteering < -steeringIncrement)
				this.vehicleSteering += steeringIncrement;
			else {
			    if (this.vehicleSteering > steeringIncrement)
					this.vehicleSteering -= steeringIncrement;
				else {
					this.vehicleSteering = 0;
				}
			}
        }

        //top speed
        if(speed > 45.0 || speed < -30.0)
            this.engineForce = 0;

        const FRONT_LEFT = 0;
        const FRONT_RIGHT = 1;
        const BACK_LEFT = 2;
        const BACK_RIGHT = 3;

        //apply force to back wheels
        this.vehicle.applyEngineForce(this.engineForce, BACK_LEFT);
        this.vehicle.applyEngineForce(this.engineForce, BACK_RIGHT);
        
        //this.vehicle.applyEngineForce(this.engineForce / 2, FRONT_LEFT);
        //this.vehicle.applyEngineForce(this.engineForce / 2, FRONT_RIGHT);
        
        this.vehicle.setBrake(this.breakingForce / 2, FRONT_LEFT);
		this.vehicle.setBrake(this.breakingForce / 2, FRONT_RIGHT);
		this.vehicle.setBrake(this.breakingForce, BACK_LEFT);
        this.vehicle.setBrake(this.breakingForce, BACK_RIGHT);
        
        this.vehicle.setSteeringValue(this.vehicleSteering, FRONT_LEFT);
        this.vehicle.setSteeringValue(this.vehicleSteering, FRONT_RIGHT);
        
        var tm, p, q;
        for(let i = 0; i < this.wheels.length; i++) {
            tm = this.vehicle.getWheelTransformWS(i);
            p = tm.getOrigin();
            q = tm.getRotation();
            this.wheels[i].mesh.position.set( p.x(), p.y(), p.z() );
            this.wheels[i].mesh.quaternion.set( q.x(), q.y(), q.z(), q.w() );
        }
    }
    tick() {
        if(bDrift && !this.drifting) {
            console.log("jump");
            this.drifting = true;
            this.gameObject.rigidBody.applyCentralImpulse(new Ammo.btVector3(0.0, 2000.0, 0.0));
        }
        else if(!bDrift && this.drifting) {
            this.drifting = false;
        }
    }
}

var localPlayer;
var Players = [];