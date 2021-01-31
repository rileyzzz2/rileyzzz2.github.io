import { GLTFLoader } from './lib/three/examples/jsm/loaders/GLTFLoader.js';
//loads necessary resources
const loader = new GLTFLoader();
const texLoader = new THREE.TextureLoader();

export async function initResources() {
    gameModels.standardKart = await loadModel("3d/karts/standard.glb");
    kartData.standardKart = loadKartData(gameModels.standardKart.scene);
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

function loadKartData(mesh) {
    var wheelAxisBackPosition = -1;
    var wheelAxisHeightBack = .3;

    var wheelAxisFrontPosition = 1.7;
    var wheelAxisHeightFront = .3;

    const frontWheelWidth = 0.3;
    const backWheelWidth = 0.4;

    var FrontLeftPosition   = new Ammo.btVector3(0.5, wheelAxisHeightFront, wheelAxisFrontPosition),
            FrontRightPosition  = new Ammo.btVector3(-0.5, wheelAxisHeightFront, wheelAxisFrontPosition),
            BackLeftPosition    = new Ammo.btVector3(0.5, wheelAxisHeightBack, wheelAxisBackPosition),
            BackRightPosition   = new Ammo.btVector3(-0.5, wheelAxisHeightBack, wheelAxisBackPosition);

    mesh.traverse(function (child) {
        if(child.name === "wheel_bl") {
            child.position.x += backWheelWidth / 2;
            BackLeftPosition = pvec(child.position);
        }
        else if(child.name === "wheel_br") {
            child.position.x -= backWheelWidth / 2;
            BackRightPosition = pvec(child.position);
        }
        else if(child.name === "wheel_fl") {
            child.position.x += frontWheelWidth / 2;
            FrontLeftPosition = pvec(child.position);
        }
        else if(child.name === "wheel_fr") {
            child.position.x -= frontWheelWidth / 2;
            FrontRightPosition = pvec(child.position);
        }
    });

    return {
        FrontLeftPosition: FrontLeftPosition,
        FrontRightPosition: FrontRightPosition,
        BackLeftPosition: BackLeftPosition,
        BackRightPosition: BackRightPosition
    };
}