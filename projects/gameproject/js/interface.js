
var allowInput = false;
var bMoveForward = false;
var bMoveBackward = false;
var bMoveRight = false;
var bMoveLeft = false;
var bDrift = false;

function ProcessInput (key, state) {
    if(!allowInput)
        return;

    switch(event.key)
    {
    case "w":
    case "ArrowUp":
        bMoveForward = state;
        break;
    case "s":
    case "ArrowDown":
        bMoveBackward = state;
        break;
    case "d":
    case "ArrowRight":
        bMoveRight = state;
        break;
    case "a":
    case "ArrowLeft":
        bMoveLeft = state;
        break;
    case " ":
        bDrift = state;
        break;
    default:
        break;
    }
}


$( document ).on('keydown', function (event) {
    if (event.defaultPrevented)
        return;
    ProcessInput(event.key, true);
})

$( document ).on('keyup', function (event) {
    if (event.defaultPrevented)
        return;
    ProcessInput(event.key, false);
})

$( document ).on('pointerlockchange', function() {
    if(document.pointerLockElement === canvas) {
        document.removeEventListener('click', beginCapture);
    } else {
        document.addEventListener('click', beginCapture);
    }
});

function beginCapture() {
    if(!inMatch)
        return;
    canvas.requestPointerLock();
}
document.addEventListener('click', beginCapture);

function clickInput() {
    console.log("click");
    if(localPlayer)
        localPlayer.useItem();
}

document.addEventListener('click', clickInput);