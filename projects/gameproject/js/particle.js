//https://aerotwist.com/tutorials/creating-particles-with-three-js/
//https://github.com/rollup/three-jsnext/blob/master/examples/webgl_points_billboards.html
class particle {
    constructor(point, velocity) {
        this.velocity = velocity;
    }
};
class sparkParticleSystem {
    constructor() {
        this.particleCount = 1800;
        this.particles = new THREE.Geometry();
        this.particleAttr = [];
        
        this.particleMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 20,
            map: gameTextures.p_spark,
            blending: THREE.AdditiveBlending,
            transparent: true
        });

        for (var p = 0; p < particleCount; p++) {
            var pX = Math.random() * 500 - 250,
                pY = Math.random() * 500 - 250,
                pZ = Math.random() * 500 - 250,
                particle = new THREE.Vector3(pX, pY, pZ);
            particle.velocity = new THREE.Vector3(
                0,
                -Math.random(),
                0); 
            
            this.particles.vertices.push(particle);
        }

        this.particleSystem = new THREE.Points(
            this.particles,
            this.pMaterial);

        this.particleSystem.sortParticles = true;
        //scene.addChild(this.particleSystem);
        objects.push(this);
    }

    update(deltaTime) {
        this.particleSystem.rotation.y += 0.01;
        var pCount = this.particleCount;
        while (pCount--) {
            let particle = this.particles.vertices[pCount];
            //respawn
            if (particle.position.y < -200) {
                particle.position.y = 200;
                particle.velocity.y = 0;
            }
            particle.velocity.y -= 0.1; //gravity

            particle.position.addSelf(particle.velocity);
        }

        this.particleSystem.geometry.__dirtyVertices = true;
    }
}