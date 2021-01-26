//https://aerotwist.com/tutorials/creating-particles-with-three-js/

class sparkParticle {
    constructor() {
        this.particleCount = 1800;
        this.particles = new THREE.Geometry();
        this.particleMaterial = new THREE.ParticleBasicMaterial({
            color: 0xFFFFFF,
            size: 20,
            map: THREE.ImageUtils.loadTexture(
            "images/particle.png"
            ),
            blending: THREE.AdditiveBlending,
            transparent: true
        });
    }
}