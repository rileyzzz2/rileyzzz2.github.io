import { GLTFLoader } from './lib/three/examples/jsm/loaders/GLTFLoader.js';
//loads necessary resources
const loader = new GLTFLoader();

export async function initResources() {
    gameModels.standardKart = await loadModel("3d/karts/standard.glb");
    gameModels.slickWheel = await loadModel("3d/wheels/slick.glb");
}

function loadModel(file) {
    return new Promise((resolve, reject) => {
        loader.load(file, data => resolve(data), null, reject);
    });
}