
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
                position: [pos.x(), pos.y(), pos.z()],
                last: debugObjects.trackpaths.length - 1
            });
        }
    }
})

var tracklines = [];
function buildTrackPaths() {
    const material = new THREE.LineBasicMaterial({
        color: 0x0000ff
    });
    for(var i = 0; i < tracklines.length; i++)
        scene.remove(tracklines[i]);
    tracklines = [];
    
    for(var i = 0; i < debugObjects.trackpaths.length; i++) {
        let segment = debugObjects.trackpaths[i];
        
        const points = [];
        if(segment.last === -1)
            points.push( mapStart );
        else {
            let lastSegment = debugObjects.trackpaths[segment.last];
            points.push( new THREE.Vector3( lastSegment.position[0], lastSegment.position[1], lastSegment.position[2] ) );
        }

        points.push( new THREE.Vector3( segment.position[0], segment.position[1], segment.position[2] ) );

        const geometry = new THREE.BufferGeometry().setFromPoints( points );
        const line = new THREE.Line( geometry, material );
        scene.add( line );

        tracklines.push(line);
    }

}