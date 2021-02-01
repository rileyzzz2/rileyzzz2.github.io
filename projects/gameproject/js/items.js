
class Coin {
    constructor(pos) {
        //console.log("creating coin " + pos[0] + " " + pos[1] + " " + pos[2]);
        this.collected = false;
        this.mesh = gameModels.coin.scene.clone();
        this.mesh.scale.multiplyScalar(0.08);
        this.mesh.position.set(pos[0], pos[1] + 0.5, pos[2]);
        scene.add(this.mesh);
        objects.push(this);

        //create collision volume
        const mass = 0.0;
        let transform = createTransform(this.mesh);
        let motionState = new Ammo.btDefaultMotionState( transform );
        var localInertia = new Ammo.btVector3( 0, 0, 0 );
        var shape = new Ammo.btSphereShape(1.0);
        shape.setMargin( 0.05 );

        shape.calculateLocalInertia( mass, localInertia );
        var rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, shape, localInertia );
        this.rigidBody = new Ammo.btRigidBody( rbInfo );
        this.rigidBody.setCollisionFlags(this.rigidBody.getCollisionFlags() | CF_NO_CONTACT_RESPONSE);
        physicsWorld.addRigidBody(this.rigidBody);
    }
    update(dt) {
        //add collection counter
        this.mesh.rotation.y += dt * 4.0;
    }
}