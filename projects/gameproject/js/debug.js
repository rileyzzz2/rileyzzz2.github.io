

$.getJSON('3d/maps/circuit_objects.json', (data) => {mapObjects = data; buildTrackPaths();});

function saveJSON(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

var closest = -1;

$( document ).on('keydown', function (event) {
    if (event.defaultPrevented)
        return;
    mapObjects.trackpaths = mapObjects.trackpaths || []

    if(event.key === 'c') {
        saveJSON(JSON.stringify(mapObjects), 'objects.json', 'text/plain');
    }
    else if(event.key === 'p') {
        var tmpTrans = new Ammo.btTransform();
        let ms = localPlayer.gameObject.rigidBody.getMotionState();
        if ( ms ) {
            ms.getWorldTransform( tmpTrans );
            var pos = tmpTrans.getOrigin();
            mapObjects.items.push({
                type: "itembox",
                position: [pos.x(), pos.y(), pos.z()]
            });
        }
    }
    else if (event.key === 't') {
        //https://threejs.org/docs/#api/en/extras/curves/SplineCurve
        var tmpTrans = new Ammo.btTransform();
        let ms = localPlayer.gameObject.rigidBody.getMotionState();
        if ( ms ) {
            ms.getWorldTransform( tmpTrans );
            var pos = tmpTrans.getOrigin();
            mapObjects.trackpaths.push({
                position: [pos.x(), pos.y(), pos.z()],
                // last: [mapObjects.trackpaths.length - 1]
                last: [closest]
            });
            console.log("last " + (mapObjects.trackpaths.length - 1));
            buildTrackPaths();
        }
    }
    else if (event.key === 'j') {
        //join closest to last places
        mapObjects.trackpaths[closest].last.push(mapObjects.trackpaths.length - 1);
        buildTrackPaths();
    }
});
//junction 24 to 31
//40 to
var tracklines = [];
function buildTrackPaths() {
    const material = new THREE.LineBasicMaterial({
        color: 0x0000ff
    });
    for(var i = 0; i < tracklines.length; i++)
        scene.remove(tracklines[i]);
    tracklines = [];
    
    for(var i = 0; i < mapObjects.trackpaths.length; i++) {
        let segment = mapObjects.trackpaths[i];
        for(var j = 0; j < segment.last.length; j++) {
            let last = segment.last[j];
            const points = [];

            if(last === -1)
                points.push( mapStart );
            else {
                let lastSegment = mapObjects.trackpaths[last];
                points.push( new THREE.Vector3( lastSegment.position[0], lastSegment.position[1], lastSegment.position[2] ) );
            }

            points.push( new THREE.Vector3( segment.position[0], segment.position[1], segment.position[2] ) );

            const geometry = new THREE.BufferGeometry().setFromPoints( points );
            const line = new THREE.Line( geometry, material );
            scene.add( line );

            tracklines.push(line);
        }
    }

}

function startDebug() {
    const markergeometry = new THREE.SphereGeometry( 0.2, 32, 32 );
    const markermaterial = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    const markersphere = new THREE.Mesh( markergeometry, markermaterial );
    scene.add( markersphere );

    window.setInterval(async function() {
        var tmpTrans = new Ammo.btTransform();
        let ms = localPlayer.gameObject.rigidBody.getMotionState();
        var playerPos = new THREE.Vector3();
        if ( ms ) {
            ms.getWorldTransform( tmpTrans );
            playerPos = tvec(tmpTrans.getOrigin());
        }

        var minDist = 100.0;
        for(var i = 0; i < mapObjects.trackpaths.length; i++) {
            let segment = mapObjects.trackpaths[i];
            var segPos = new THREE.Vector3(segment.position[0], segment.position[1], segment.position[2]);
            var dist = playerPos.distanceTo(segPos);
            minDist = Math.min(minDist, dist);
            if(minDist === dist)
                closest = i;
        }

        if(closest !== -1) {
            var closestpos = mapObjects.trackpaths[closest].position;
            markersphere.position.set(closestpos[0], closestpos[1], closestpos[2]);
        }
    }, 100.0);
}