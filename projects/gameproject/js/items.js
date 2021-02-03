
class Item {
    constructor(mesh, index) {
        this.collected = false;
        this.mesh = mesh;
        this.index = index;

        const mass = 0.0;
        let transform = createTransform(this.mesh);
        let motionState = new Ammo.btDefaultMotionState( transform );
        var localInertia = new Ammo.btVector3( 0, 0, 0 );
        var shape = new Ammo.btSphereShape(1.0);
        shape.setMargin( 0.05 );

        shape.calculateLocalInertia( mass, localInertia );
        var rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, shape, localInertia );
        this.rigidBody = new Ammo.btRigidBody( rbInfo );
        //this.rigidBody.setCollisionFlags(this.rigidBody.getCollisionFlags() | CF_CUSTOM_MATERIAL_CALLBACK | CF_NO_CONTACT_RESPONSE); //CF_NO_CONTACT_RESPONSE
        this.rigidBody.setCollisionFlags(this.rigidBody.getCollisionFlags() | CF_NO_CONTACT_RESPONSE);
        physicsWorld.addRigidBody(this.rigidBody);

        objects.push(this);
    }
}
class Coin extends Item {
    constructor(pos, index) {
        //console.log("creating coin " + pos[0] + " " + pos[1] + " " + pos[2]);

        var mesh = gameModels.coin.scene.clone();
        mesh.scale.multiplyScalar(0.08);
        mesh.position.set(pos[0], pos[1] + 0.5, pos[2]);
        scene.add(mesh);
        
        super(mesh, index);
        
    }
    collect() {
        this.collected = true;
        this.mesh.visible = false;
    }
    update(dt) {
        //add collection counter
        this.mesh.rotation.y += dt * 4.0;
    }
    beginContact() {
        this.collect();
        if(localPlayer.collectedCoins < 10)
            setCoinCount(localPlayer.collectedCoins + 1);
        
        var data = {
            type: "itemCollected",
            index: this.index
        };

        for(const client in remoteConnections)
            remoteConnections[client].conn.send(data);
    }
}