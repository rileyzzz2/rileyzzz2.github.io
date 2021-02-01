
var debugObjects = {
    coins: []
};

function saveJSON(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

$( document ).on('keydown', function (event) {
    if (event.defaultPrevented)
        return;

    if(event.key === 'c') {
        saveJSON(JSON.stringify(debugObjects), 'objects.json', 'text/plain');
    }
    else if(event.key === 'p') {
        var tmpTrans = new Ammo.btTransform();
        let ms = localPlayer.gameObject.rigidBody.getMotionState();
        if ( ms ) {
            ms.getWorldTransform( tmpTrans );
            var pos = tmpTrans.getOrigin();
            debugObjects.coins.push({
                position: [pos.x(), pos.y(), pos.z()]
            });
        }
    }
})