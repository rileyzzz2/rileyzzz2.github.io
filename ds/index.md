## MelonDS-Emscripten

A SDL2/GLEW frontend for MelonDS I created in March 2021, compiled through Emscripten.


## Controls

A: X

B: Z

X: S

Y: A

L: Q

R: W

D-pad: Arrow Keys


<button type="button" id="fullscreen">Fullscreen</button>
<div class="emscripten"><progress id="progress" max="1" value="0" hidden=""></progress></div>
<div class="emscripten_border">
	<canvas class="emscripten" id="canvas" oncontextmenu="event.preventDefault()" tabindex="-1" width="650" height="580" style="cursor: default;"></canvas>
</div>
<script>
var statusElement=document.getElementById("status"),progressElement=document.getElementById("progress"),spinnerElement=document.getElementById("spinner"),
Module={
	preRun:[],
	postRun:[],
	print: function(text) {console.log("stdout: " + text);},
	printErr: function(text){ console.error("stderr: " + text); },
	canvas: document.getElementById("canvas"),
	totalDependencies:0,
};

//var canvas = document.getElementById("canvas");
//Module.setStatus("Downloading..."),
//window.onerror=function(e){Module.setStatus("Exception thrown, see JavaScript console"),spinnerElement.style.display="none",Module.setStatus=function(e){e&&Module.printErr("[post-exception status] "+e)}}

</script>
<script async="" src="melonDS.js"></script>
