
var debugObjects = {
    items: [],
    objects: []
};

$.getJSON('3d/maps/delfino_objects.json', (data) => {debugObjects = data;});

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
    debugObjects.trackpaths = debugObjects.trackpaths || []

    if(event.key === 'c') {
        saveJSON(JSON.stringify(debugObjects), 'objects.json', 'text/plain');
    }
    else if(event.key === 'p') {
        var tmpTrans = new Ammo.btTransform();
        let ms = localPlayer.gameObject.rigidBody.getMotionState();
        if ( ms ) {
            ms.getWorldTransform( tmpTrans );
            var pos = tmpTrans.getOrigin();
            debugObjects.items.push({
                type: "itembox",
                position: [pos.x(), pos.y(), pos.z()]
            });
        }
    }
    else if (event.key === 't') {
        //https://threejs.org/docs/#api/en/extras/curves/SplineCurve
        let ms = localPlayer.gameObject.rigidBody.getMotionState();
        if ( ms ) {
            ms.getWorldTransform( tmpTrans );
            var pos = tmpTrans.getOrigin();
            debugObjects.trackpaths.push({
                position: [pos.x(), pos.y(), pos.z()]
            });
        }
    }
})