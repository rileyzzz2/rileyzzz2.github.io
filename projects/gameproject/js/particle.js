//https://aerotwist.com/tutorials/creating-particles-with-three-js/
//https://github.com/rollup/three-jsnext/blob/master/examples/webgl_points_billboards.html

class sparkParticleSystem {
    constructor() {
        this.driftColor_1 = new THREE.Color( 0.25, 0.25, 1.0 );
        this.driftColor_2 = new THREE.Color( 1.0, 0.5, 0.0 );
        this.driftColor_3 = new THREE.Color( 1.0, 0.0, 0.75 );

        this.particleGroup = new SPE.Group({
                texture: {
                    value: gameTextures.p_spark
                },
                blending: THREE.AdditiveBlending //NormalBlending
            });
        this.smokeGroup = new SPE.Group({
                texture: {
                    value: gameTextures.p_smoke
                },
                blending: THREE.NormalBlending //NormalBlending
            });
        this.emitter = new SPE.Emitter({
                particleCount: 50,
                maxAge: {
                    value: 0.2,
                },
                position: {
                    value: new THREE.Vector3( 0, 0, 0 ),
                    spread: new THREE.Vector3( 0.2, 0.2, 0.2 )
                },
                velocity: {
                    value: new THREE.Vector3( 0, 8.0, 0 ),
                    spread: new THREE.Vector3( 1.8, 4.0, 1.8 )
                },
                acceleration: {
                    value: new THREE.Vector3( 0, -9.8, 0 )
                },
                wiggle: {
                    spread: 0
                },
                size: {
                    value: 0.2,
                    spread: 0.1
                },
                opacity: {
                    value: [ 1, 0 ]
                },
                color: {
                    value: this.driftColor_1,
                    spread: new THREE.Color( 0.1, 0.1, 0.1 )
                },
                angle: {
                    value: [ 0, Math.PI * 0.125 ]
                }
            });

        this.smokeEmitter = new SPE.Emitter({
                particleCount: 50,
                maxAge: {
                    value: 0.1,
                },
                position: {
                    value: new THREE.Vector3( 0, 0, 0 ),
                    spread: new THREE.Vector3( 0.2, 0.2, 0.2 )
                },
                velocity: {
                    value: new THREE.Vector3( 0, 4.0, 0 ),
                    spread: new THREE.Vector3( 1.8, 3.8, 1.8 )
                },
                acceleration: {
                    value: new THREE.Vector3( 0, -9.8, 0 )
                },
                wiggle: {
                    spread: 0
                },
                size: {
                    value: 0.8,
                    spread: 0.1
                },
                opacity: {
                    value: [ 0, 0.2, 0 ]
                },
                color: {
                    value: new THREE.Color(0.7, 0.7, 0.7),
                    spread: new THREE.Color( 0.1, 0.1, 0.1 )
                },
                angle: {
                    value: [ 0, Math.PI * 0.125 ]
                }
            });

        this.particleGroup.addEmitter(this.emitter);
        this.particleGroup.mesh.frustumCulled = false;

        this.smokeGroup.addEmitter(this.smokeEmitter);
        this.smokeGroup.mesh.frustumCulled = false;

        scene.add(this.particleGroup.mesh);
        scene.add(this.smokeGroup.mesh);
        objects.push(this);
    }

    update(deltaTime) {
        this.particleGroup.tick(deltaTime);
        this.smokeGroup.tick(deltaTime);
        // this.particleSystem.rotation.y += 0.01;
        // var pCount = this.particleCount;
        // while (pCount--) {
        //     this.particleAttr[pCount].update(deltaTime);
        //     // let particle = this.particleGeom.vertices[pCount];
        //     // //respawn
        //     // if (particle.position.y < -200) {
        //     //     particle.position.y = 200;
        //     //     particle.velocity.y = 0;
        //     // }
        //     // particle.velocity.y -= 0.1; //gravity

        //     // particle.position.addSelf(particle.velocity);
        // }
        // this.particleSystem.geometry.attributes.position.needsUpdate = true;
        // //this.particleSystem.geometry.__dirtyVertices = true;
    }

    setEmissionRate(rate) {
        this.emitter.activeMultiplier = rate;
        this.smokeEmitter.activeMultiplier = rate;
    }

    setDriftTime(time) {
        this.setEmissionRate(1.0);
        if(time > 3.0)
            this.emitter.color.value = this.driftColor_3;
        else if(time > 1.5)
            this.emitter.color.value = this.driftColor_2;
        else if (time > 0.5)
            this.emitter.color.value = this.driftColor_1;
        else
            this.setEmissionRate(0.0);
    }

    setPosition(pos) {
        this.emitter.position.value = pos;
        this.smokeEmitter.position.value = pos;
    }
}