var bMoveForward = false;
var bMoveBackward = false;
var bMoveRight = false;
var bMoveLeft = false;
var bDrift = false;

function ProcessInput (key, state) {
    switch(event.key)
    {
    case "ArrowUp":
        bMoveForward = state;
        break;
    case "ArrowDown":
        bMoveBackward = state;
        break;
    case "ArrowRight":
        bMoveRight = state;
        break;
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