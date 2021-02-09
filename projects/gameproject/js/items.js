
class Item {
    constructor(mesh, index) {
        this.collected = false;
        this.mesh = mesh;
        this.index = index;
        this.collectedTime = 0.0;

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
        this.collectedTime = 0.0;
        this.mesh.visible = false;
    }
    uncollect() {
        this.collected = false;
        this.mesh.visible = true;
    }
    update(dt) {
        //add to collection counter
        if(this.collected) {
            this.collectedTime += dt;
            if(this.collectedTime > 30.0)
                this.uncollect();
        }
        
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

class ItemBox extends Item {
    constructor(pos, index) {
        var mesh = gameModels.itembox.scene.clone();
        mesh.scale.multiplyScalar(0.06);
        mesh.position.set(pos[0], pos[1] + 0.6, pos[2]);
        scene.add(mesh);
        
        super(mesh, index);
        
        this.fontMesh = gameModels.itembox_font.scene.clone();
        this.fontMesh.scale.multiplyScalar(0.06);
        this.fontMesh.position.copy(mesh.position);
        scene.add(this.fontMesh);
    }
    collect() {
        this.collected = true;
        this.collectedTime = 0.0;
        this.mesh.visible = false;
        this.fontMesh.visible = false;
    }
    uncollect() {
        this.collected = false;
        this.mesh.visible = true;
        this.fontMesh.visible = true;
    }
    update(dt) {
        //add to collection counter
        if(this.collected) {
            this.collectedTime += dt;
            if(this.collectedTime > 30.0)
                this.uncollect();
        }
        
        this.fontMesh.rotation.setFromRotationMatrix( camera.matrixWorld );
        //this.fontMesh.lookAt(camera.position);
        this.mesh.rotation.x += dt * 2.0;
        this.mesh.rotation.y += dt * 4.0;
    }
    beginContact() {
        this.collect();

        //give item to player
        if(localPlayer.heldItem === ITEM_NONE) {
            localPlayer.playItemAnimation();
            var newItem = Math.floor(Math.random() * ITEM_MAX);
            localPlayer.heldItem = newItem;
        }

        var data = {
            type: "itemCollected",
            index: this.index
        };

        for(const client in remoteConnections)
            remoteConnections[client].conn.send(data);
    }
}

class mapItem {
    constructor(mesh, mass) {
        this.index = activeMap.items.length;
        this.collected = false;

        //const mass = 0.0;
        let transform = createTransform(mesh);
        let motionState = new Ammo.btDefaultMotionState( transform );
        var localInertia = new Ammo.btVector3( 0, 0, 0 );
        var shape = new Ammo.btSphereShape(0.3);
        shape.setMargin( 0.05 );

        shape.calculateLocalInertia( mass, localInertia );
        var rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, shape, localInertia );
        this.rigidBody = new Ammo.btRigidBody( rbInfo );
        this.rigidBody.setCollisionFlags(this.rigidBody.getCollisionFlags() | CF_NO_CONTACT_RESPONSE);
        physicsWorld.addRigidBody(this.rigidBody);

    }

    collect() {
        activeMap.items.splice(this.index, 1);
        physicsWorld.removeRigidBody(this.rigidBody);
        scene.remove(this.mesh);
    }
}

class itemBanana extends mapItem {
    constructor(pos) {
        var mesh = gameModels.item_banana.scene.clone();
        mesh.scale.multiplyScalar(0.1);
        mesh.position.set(pos.x, pos.y, pos.z);
        scene.add(mesh);
        
        super(mesh, 0.0);
        this.mesh = mesh;
    }
    beginContact() {
        console.log("banana contact");
        this.collect();

        //slow down local player
        localPlayer.stopHit();
        
        var data = {
            type: "itemCollected",
            index: this.index
        };

        for(const client in remoteConnections)
            remoteConnections[client].conn.send(data);
    }
}

class itemGreenShell extends mapItem {
    constructor(pos, vel) {
        var mesh = gameModels.item_shell_green.scene.clone();
        mesh.scale.multiplyScalar(0.1);
        mesh.position.set(pos.x, pos.y, pos.z);
        scene.add(mesh);
        
        super(mesh, 1000.0);
        this.mesh = mesh;
        vel.y = 0.0;
        this.vel = vel;
        this.vel.multiplyScalar(40.0);

        objects.push(this);
        this.rigidBody.setCollisionFlags(this.rigidBody.getCollisionFlags() & ~CF_NO_CONTACT_RESPONSE);
        this.rigidBody.setRestitution(1.0);
        this.rigidBody.setDamping(0.1, 0.0);
        this.gameObject = new GameObject(this.mesh, this.rigidBody);
        objects.push(this.gameObject);

        this.rigidBody.setLinearVelocity(pvec(this.vel));
    }
    update(dt) {
        
        // var ms = this.rigidBody.getMotionState();
        // var c = new Ammo.btTransform();
        // ms.getWorldTransform(c);
        // var origin = tvec(c.getOrigin());

        // var frameVel = this.vel.clone();
        // frameVel.multiplyScalar(dt);
        // origin.add(frameVel);

        // c.setOrigin(pvec(origin));
        // ms.setWorldTransform(c);
    }
    beginContact() {
        console.log("shell contact");
        this.collect();

        //slow down local player
        localPlayer.stopHit();
        
        var data = {
            type: "itemCollected",
            index: this.index
        };

        for(const client in remoteConnections)
            remoteConnections[client].conn.send(data);
    }
}