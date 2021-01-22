
//https://medium.com/@bluemagnificent/intro-to-javascript-3d-physics-using-ammo-js-and-three-js-dd48df81f591
//https://medium.com/media/4841d3cf6d0b8898cca4b1474dbf32b6
//https://github.com/kripken/ammo.js/blob/master/examples/webgl_demo_softbody_volume/index.html


//https://pybullet.org/Bullet/phpBB3/viewtopic.php?f=9&t=3052&start=15
// void contact_added_callback_obj (btManifoldPoint& cp,
//                                  const btCollisionObject* colObj,
//                                  int partId, int index)
// {
//         (void) partId;
//         (void) index;
//         const btCollisionShape *shape = colObj->getCollisionShape();

//         if (shape->getShapeType() != TRIANGLE_SHAPE_PROXYTYPE) return;
//         const btTriangleShape *tshape =
//                static_cast<const btTriangleShape*>(colObj->getCollisionShape());


//         const btCollisionShape *parent = colObj->getRootCollisionShape();
//         if (parent == NULL) return;
//         if (parent->getShapeType() != TRIANGLE_MESH_SHAPE_PROXYTYPE) return;

//         btTransform orient = colObj->getWorldTransform();
//         orient.setOrigin( btVector3(0.0f,0.0f,0.0f ) );

//         btVector3 v1 = tshape->m_vertices1[0];
//         btVector3 v2 = tshape->m_vertices1[1];
//         btVector3 v3 = tshape->m_vertices1[2];

//         btVector3 normal = (v2-v1).cross(v3-v1);

//         normal = orient * normal;
//         normal.normalize();

//         btScalar dot = normal.dot(cp.m_normalWorldOnB);
//         btScalar magnitude = cp.m_normalWorldOnB.length();
//         normal *= dot > 0 ? magnitude : -magnitude;

//         cp.m_normalWorldOnB = normal;
// }

// bool contact_added_callback (btManifoldPoint& cp,
//                              const btCollisionObject* colObj0,
//                              int partId0, int index0,
//                              const btCollisionObject* colObj1,
//                              int partId1, int index1)
// {
//         contact_added_callback_obj(cp, colObj0, partId0, index0);
//         contact_added_callback_obj(cp, colObj1, partId1, index1);
//         //std::cout << to_ogre(cp.m_normalWorldOnB) << std::endl;
//         return true;
// }

let physicsWorld;
var rigidBodies = [], tmpTrans;
function initPhysicsWorld() {
    let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
    dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
    broadphase              = new Ammo.btDbvtBroadphase(),
    solver                  = new Ammo.btSequentialImpulseConstraintSolver();

    physicsWorld           = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0.0, -9.8, 0.0));


    //https://github.com/kripken/ammo.js/blob/a4bec933859e452acd2c18e4152ac2a6a95e806f/tests/add-function.js
    console.log("adding callback");
    //world.set_gContactAddedCallback
    let callback = Ammo.addFunction((cp, colObj0Wrap, partId0, index0, colObj1Wrap, partId1, index1) => {
        alert("contact!");
        colObj0Wrap = Ammo.wrapPointer(colObj0Wrap, Ammo.btCollisionObjectWrapper);
        let colObj0 = colObj0Wrap.getCollisionObject();

        colObj1Wrap = Ammo.wrapPointer(colObj1Wrap, Ammo.btCollisionObjectWrapper);
        let colObj1 = colObj1Wrap.getCollisionObject();

    }, Ammo.CONTACT_ADDED_CALLBACK_SIGNATURE);
    //physicsWorld.set_gContactAddedCallback(callback);
    physicsWorld.setContactAddedCallback(callback);
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