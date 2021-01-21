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
        var suspensionRestLength = 0.6;
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

        //vehicle variables
        var chassisWidth = 1.8;
        var chassisHeight = .6;
        var chassisLength = 4;
        var massVehicle = 800;

        var wheelAxisBackPosition = -1;
        var wheelAxisHeightBack = .3;

        var wheelAxisFrontPosition = 1.7;
        var wheelAxisHeightFront = .3;

        var steeringIncrement = .04;
        var steeringClamp = .5;
        var maxEngineForce = 2000;
        var maxBreakingForce = 100;



        const mass = 0.2;
        const box = new THREE.BufferGeometry().fromGeometry(new THREE.BoxGeometry());
        let mesh = new THREE.Mesh( box, new THREE.MeshStandardMaterial( { color: 0x0000ff } ) );
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
        var engineForce = 0;
        var vehicleSteering = 0;
        var breakingForce = 0;
        var tuning = new Ammo.btVehicleTuning();
        var rayCaster = new Ammo.btDefaultVehicleRaycaster(physicsWorld);
        this.vehicle = new Ammo.btRaycastVehicle(tuning, body, rayCaster);
        this.vehicle.setCoordinateSystem(0, 1, 2);
        physicsWorld.addAction(this.vehicle);
        
        this.wheels = [
            new Wheel(true, this.vehicle, new Ammo.btVector3(1, wheelAxisHeightFront, wheelAxisFrontPosition), .35, .2, tuning),
            new Wheel(true, this.vehicle, new Ammo.btVector3(-1, wheelAxisHeightFront, wheelAxisFrontPosition), .35, .2, tuning),
            new Wheel(false, this.vehicle, new Ammo.btVector3(1, wheelAxisHeightBack, wheelAxisBackPosition), .4, .3, tuning),
            new Wheel(false, this.vehicle, new Ammo.btVector3(-1, wheelAxisHeightBack, wheelAxisBackPosition), .4, .3, tuning)
        ];


        thinkers.push(this);
    }

    tick() {
        var tm, p, q;
        for(let i = 0; i < this.wheels.length; i++) {
            tm = this.vehicle.getWheelTransformWS(i);
            p = tm.getOrigin();
            q = tm.getRotation();
            this.wheels[i].mesh.position.set( p.x(), p.y(), p.z() );
            this.wheels[i].mesh.quaternion.set( q.x(), q.y(), q.z(), q.w() );
        }
    }
}

var localPlayer;
var Players = [];