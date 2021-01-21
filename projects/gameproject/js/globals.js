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