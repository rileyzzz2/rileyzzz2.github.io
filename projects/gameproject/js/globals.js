var canvas = $("#gameWindow")[0];
var objects = [];
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

class GameObject {
    constructor(mesh, rigidBody) {
        this.mesh = mesh;
        this.rigidBody = rigidBody;
    }
    update(deltaTime) {
        var tmpTrans = new Ammo.btTransform();
        let ms = this.rigidBody.getMotionState();
        if ( ms ) {
            ms.getWorldTransform( tmpTrans );
            let p = tmpTrans.getOrigin();
            let q = tmpTrans.getRotation();
            this.mesh.position.set( p.x(), p.y(), p.z() );
            this.mesh.quaternion.set( q.x(), q.y(), q.z(), q.w() );
        }
    }
}

class Kart {
    constructor() {
        const mass = 0.2;
        const box = new THREE.BufferGeometry().fromGeometry(new THREE.BoxGeometry());
        let mesh = new THREE.Mesh( box, new THREE.MeshStandardMaterial( { color: 0x00ff00 } ) );
        scene.add(mesh);

        let transform = createTransform(mesh);
        let motionState = new Ammo.btDefaultMotionState( transform );
        var localInertia = new Ammo.btVector3( 0, 0, 0 );
        var shape = new Ammo.btBoxShape(new Ammo.btVector3(mesh.scale.x * 0.5, mesh.scale.y * 0.5, mesh.scale.z * 0.5));
        shape.setMargin( 0.05 );

        shape.calculateLocalInertia( mass, localInertia );
        var rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, shape, localInertia );
        var body = new Ammo.btRigidBody( rbInfo );
        physicsWorld.addRigidBody(body);
        this.gameObject = new GameObject(mesh, body);
        objects.push(this.gameObject);


    }
}

var localPlayer;
var Players = [];