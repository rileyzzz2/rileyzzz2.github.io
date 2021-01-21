
let physicsWorld;
var rigidBodies = [], tmpTrans;
function initPhysicsWorld() {
    let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
    dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
    overlappingPairCache    = new Ammo.btDbvtBroadphase(),
    solver                  = new Ammo.btSequentialImpulseConstraintSolver();

    physicsWorld           = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0.0, -9.8, 0.0));
}

function pvec(vec)
{
    return new Ammo.btVector3(vec.x, vec.y, vec.z);
}
function pquat(quat)
{
    return new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w);
}

function createTransform(mesh) {
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(pvec(mesh.position));
    transform.setRotation(pquat(mesh.quaternion));
    return transform;
}

function createRigidBox(mesh, mass) {
    let transform = createTransform(mesh);
    let motionState = new Ammo.btDefaultMotionState( transform );
    var localInertia = new Ammo.btVector3( 0, 0, 0 );
    mesh.geometry.computeBoundingBox();
    var shape = new Ammo.btBoxShape(new Ammo.btVector3(mesh.scale.x * 0.5, mesh.scale.y * 0.5, mesh.scale.z * 0.5));
    shape.setMargin( 0.05 );
    //let mass = 0.5;

    shape.calculateLocalInertia( mass, localInertia );
    var rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, shape, localInertia );
    var body = new Ammo.btRigidBody( rbInfo );
    physicsWorld.addRigidBody( body );
    mesh.userData.physicsBody = body;
    rigidBodies.push(mesh);
    //mesh.geometry.boundingBox.min/max
    //let colShape = new Ammo.btBoxShape( new Ammo.btVector3( scale.x * 0.5, scale.y * 0.5, scale.z * 0.5 ) );
    //colShape.setMargin( 0.05 );
}