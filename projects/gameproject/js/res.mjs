import { GLTFLoader } from './lib/three/examples/jsm/loaders/GLTFLoader.js';
//loads necessary resources
const loader = new GLTFLoader();
const texLoader = new THREE.TextureLoader();

export async function initResources() {
    gameModels.standardKart = await loadModel("3d/karts/standard.glb");
    gameModels.slickWheel = await loadModel("3d/wheels/slick.glb");
    gameModels.stopper = await loadModel("3d/objects/stopper.glb");
    gameTextures.p_spark = await loadTexture("particles/flare_01.png");

}

export function loadModel(file) {
    return new Promise((resolve, reject) => {
        loader.load(file, data => resolve(data), null, reject);
    });
}

export function loadTexture(file) {
    return new Promise((resolve, reject) => {
        texLoader.load(file, data => resolve(data), null, reject);
    });
}