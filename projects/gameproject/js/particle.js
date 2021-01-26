//https://aerotwist.com/tutorials/creating-particles-with-three-js/

class sparkParticle {
    constructor() {
        this.particleCount = 1800;
        this.particles = new THREE.Geometry();
        this.particleMaterial = new THREE.ParticleBasicMaterial({
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
            particle = new THREE.Vertex(
                new THREE.Vector3(pX, pY, pZ)
            );
            particle.velocity = new THREE.Vector3(
                0,
                -Math.random(),
                0); 
            
            this.particles.vertices.push(particle);
        }

        this.particleSystem = new THREE.ParticleSystem(
            this.particles,
            this.pMaterial);

        this.particleSystem.sortParticles = true;
        //scene.addChild(this.particleSystem);
        objects.push(this);
    }

    update(deltaTime) {
        this.particleSystem.rotation.y += 0.01;
        var pCount = particleCount;
        while (pCount--) {

        }
    }
}