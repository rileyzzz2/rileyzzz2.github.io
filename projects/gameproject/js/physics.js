
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

function contact_obj(cp, colObj, partId, index) {
    
    //const btCollisionShape *shape = colObj->getCollisionShape();
    const shape = colObj.getCollisionShape();
    //shape should be btConvexPolyhedron
    var testshape = Ammo.wrapPointer(shape, Ammo.btFace);
    var testshape2 = Ammo.wrapPointer(shape, Ammo.btConvexHullShape);

    if(testshape.m_indices === undefined)
        return;
    console.log("poly vert length " + testshape.m_indices.size()); //getNumVertices()
    console.log("poly vert length 2 " + testshape2.getConvexPolyhedron().m_faces.size()); //getNumVertices()
    console.log("contact: part " + partId + " index " + index);

    var orient = colObj.getWorldTransform();
    orient.setOrigin(new Ammo.btVector3(0.0, 0.0, 0.0));

    // var buffer = Ammo._malloc(16*4);
    // orient.getOpenGLMatrix(buffer);
    // var jsBuffer = HEAPF32.subarray(buffer/4, buffer/4 + 16);
    // Ammo.free(buffer);

    let transform = new THREE.Matrix4();
    //transform.fromArray(jsBuffer);
    transform.compose(tvec(orient.getOrigin()), tquat(orient.getRotation()), new THREE.Vector3(1.0, 1.0, 1.0));
    let geom = mapCollisionData[shape];
    if(geom && index < geom.vertices.length) {
        //unsure
        let a = geom.vertices[index].clone();
        let b = geom.vertices[index + 1].clone();
        let c = geom.vertices[index + 2].clone();
        console.log("found collision match!");

        let normal = (b.sub(a)).cross(c.sub(a));

        normal.applyMatrix4(transform);
        normal.normalize();

        let dot = normal.dot(tvec(cp.m_normalWorldOnB)); //m_normalWorldOnB
        let magnitude = cp.m_normalWorldOnB.length();

        normal.multiplyScalar(dot > 0.0 ? magnitude : -magnitude);

        cp.m_normalWorldOnB = pvec(normal);
        //         btVector3 normal = (v2-v1).cross(v3-v1);

//         normal = orient * normal;
//         normal.normalize();

//         btScalar dot = normal.dot(cp.m_normalWorldOnB);
//         btScalar magnitude = cp.m_normalWorldOnB.length();
//         normal *= dot > 0 ? magnitude : -magnitude;

    }
    //let arr = colObj.getIndexedMeshArray();
    // if(arr) {
    //     console.log("array exists!!!");
    // }
    //const parent = colObj.getRootCollisionShape();
    // console.log("shape properties: ");
    // Object.getOwnPropertyNames(shape).map(item => {
    //     console.log(item);
    // });
    //console.log("margin " + shape);

    //if (shape->getShapeType() != TRIANGLE_SHAPE_PROXYTYPE)

    // if(shape.getShapeType() !== TRIANGLE_SHAPE_PROXYTYPE) {
    //     console.log("not triangle shape");
    //     return;
    // }

    // if(parent === null) {
    //     console.log("null parent");
    //     return;
    // }
    // if(parent.getShapeType() !== TRIANGLE_SHAPE_PROXYTYPE) {
    //     console.log("parent not triangle shape");
    //     return;
    // }

   

    //console.log("vert " + shape.m_vertices1[0]);
    //console.log("vert: " + shape.a);
    //Object.keys(shape).forEach((prop)=> console.log(prop));

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

    //         btTransform orient = colObj->getWorldTransform();
//         orient.setOrigin( btVector3(0.0f,0.0f,0.0f ) );

}

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
//     let callback = Ammo.addFunction((cp, colObj0Wrap, partId0, index0, colObj1Wrap, partId1, index1) => { //cp, colObj0Wrap, partId0, index0, colObj1Wrap, partId1, index1
//         if(cp === undefined)
//             return;

//         let testcp = Ammo.wrapPointer(cp, Ammo.btManifoldPoint);
//         let colObj0 = Ammo.wrapPointer(colObj0Wrap, Ammo.btCollisionObjectWrapper);
//         //let colObj0 = colObj0Wrap.getCollisionObject();

//         let colObj1 = Ammo.wrapPointer(colObj1Wrap, Ammo.btCollisionObjectWrapper);
//         //let colObj1 = colObj1Wrap.getCollisionObject();

//         contact_obj(testcp, colObj0, partId0, index0);
//         contact_obj(testcp, colObj1, partId1, index1);
// //         contact_added_callback_obj(cp, colObj0, partId0, index0);
// //         contact_added_callback_obj(cp, colObj1, partId1, index1);
//         //return true;
//     }, Ammo.CONTACT_ADDED_CALLBACK_SIGNATURE);
//     physicsWorld.setContactAddedCallback(callback);
    console.log("added callback");
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