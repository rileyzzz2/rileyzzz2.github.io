import {startRenderer} from './render.mjs';

Ammo().then(startRenderer);

document.addEventListener('click', onClick);
function onClick() {
    // const box = new THREE.BufferGeometry().fromGeometry(new THREE.BoxGeometry());
    // let newcube = new THREE.Mesh( box, material );
    // newcube.castShadow = true;
    // scene.add(newcube);
    // newcube.position.set(camera.position.x, camera.position.y, camera.position.z);
    // newcube.scale.set(1.0, 1.0, 1.0);
    // createRigidBox(newcube, 0.2);
}