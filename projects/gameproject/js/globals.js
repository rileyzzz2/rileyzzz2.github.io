var canvas = $("#gameWindow")[0];
var objects = [];
var thinkers = [];

//resources
var gameModels = {};
var gameTextures = {};
var activeMap;
var mapCollisionData = {};
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//var cameraHelper = new THREE.CameraHelper(camera);
//scene.add(cameraHelper);

function pvec(vec)
{
    return new Ammo.btVector3(vec.x, vec.y, vec.z);
}
function pquat(quat)
{
    return new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w);
}

function tvec(vec)
{
    return new THREE.Vector3(vec.x(), vec.y(), vec.z());
}

function tquat(quat)
{
    return new THREE.Quaternion(quat.x(), quat.y(), quat.z(), quat.w());
}


window.setInterval(function() {
    for(let i = 0; i < thinkers.length; i++)
        thinkers[i].tick();
}, 1.0 / 60.0 * 1000.0);

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

//helpers
const CF_CUSTOM_MATERIAL_CALLBACK = 8;
const TRIANGLE_SHAPE_PROXYTYPE = 1; //unsure