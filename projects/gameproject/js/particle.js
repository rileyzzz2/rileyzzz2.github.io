//https://aerotwist.com/tutorials/creating-particles-with-three-js/
//https://github.com/rollup/three-jsnext/blob/master/examples/webgl_points_billboards.html
class particle {
    constructor() {
        this.respawn();
    }
    respawn() {
        this.position.set(0.0, 0.0, 0.0);
        this.velocity = new THREE.Vector3(
                        0,
                        Math.random() * 10.0,
                        0);
    }
    update(deltaTime) {
        //respawn
        if (this.position.y < -200)
            this.respawn();
        
        particle.velocity.y -= 0.1; //gravity
        particle.position.addSelf(this.velocity);
    }
};
class sparkParticleSystem {
    constructor() {
        this.particleCount = 1800;
        this.particleGeom = new THREE.Geometry();
        this.particleAttr = [];
        
        this.particleMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 20,
            map: gameTextures.p_spark,
            blending: THREE.AdditiveBlending,
            transparent: true
        });

        for (var p = 0; p < particleCount; p++) {
            let curParticle = new particle();
            this.particleAttr.push(curParticle);
            this.particleGeom.vertices.push(curParticle.position);
        }

        this.particleSystem = new THREE.Points(
            this.particleGeom,
            this.pMaterial);

        //this.particleSystem.sortParticles = true;
        //scene.addChild(this.particleSystem);
        objects.push(this);
    }

    update(deltaTime) {
        this.particleSystem.rotation.y += 0.01;
        var pCount = this.particleCount;
        while (pCount--) {
            this.particleAttr[pCount].update(deltaTime);
            // let particle = this.particleGeom.vertices[pCount];
            // //respawn
            // if (particle.position.y < -200) {
            //     particle.position.y = 200;
            //     particle.velocity.y = 0;
            // }
            // particle.velocity.y -= 0.1; //gravity

            // particle.position.addSelf(particle.velocity);
        }

        this.particleSystem.geometry.__dirtyVertices = true;
    }
}