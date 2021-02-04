import { GLTFLoader } from './lib/three/examples/jsm/loaders/GLTFLoader.js';
import { SkeletonUtils } from './lib/three/examples/jsm/utils/SkeletonUtils.js';
import { RGBELoader } from './lib/three/examples/jsm/loaders/RGBELoader.js';
SkelUtils = SkeletonUtils;
//loads necessary resources
const loader = new GLTFLoader();
const RGBE = new RGBELoader();
const texLoader = new THREE.TextureLoader();
RGBE.setDataType(THREE.UnsignedByteType).setPath('3d/');

export async function initResources() {
    gameModels.standardKart =       await loadModel("3d/karts/standard.glb");
    kartData.standardKart =         loadKartData(gameModels.standardKart.scene);
    gameModels.slickWheel =         await loadModel("3d/wheels/slick.glb");

    playerModels.mario =            await loadModel("3d/racers/mario.glb");

    gameModels.stopper =            await loadModel("3d/objects/stopper.glb");
    gameModels.coin =               await loadModel("3d/objects/coin.glb");
    gameModels.itembox =            await loadModel("3d/objects/itembox.glb");
    gameModels.itembox_font =       await loadModel("3d/objects/itembox_font.glb");
    
    gameModels.itembox.scene.traverse(function(child) {
        if(child.name === "ItemBoxRef__M_ItemBoxRef") {
            child.material.opacity = 0.5;
        }
    });

    gameTextures.p_spark =          await loadTexture("particles/flare_01.png");
    gameTextures.p_smoke =          await loadTexture("particles/smoke.png");

    gameModels.item_shell_green =   await loadModel("3d/objects/greenshell.glb");
    gameModels.item_shell_red =     await loadModel("3d/objects/redshell.glb");
    gameModels.item_shell_blue =    await loadModel("3d/objects/blueshell.glb");
    gameModels.item_banana =        await loadModel("3d/objects/banana.glb");
    gameModels.item_mushroom =      await loadModel("3d/objects/mushroom.glb");
    gameModels.item_mushroom_gold = await loadModel("3d/objects/goldmushroom.glb");
    gameModels.item_lightning =     await loadModel("3d/objects/lightning.glb");
    gameModels.item_star =          await loadModel("3d/objects/star.glb");

    gameTextures.env = await loadRGBE('env.hdr');
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

export function loadRGBE(file) {
    return new Promise((resolve, reject) => {
        RGBE.load(file, data => resolve(data), null, reject);
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